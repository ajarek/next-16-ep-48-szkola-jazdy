#!/usr/bin/env node
/**
 * Uzupełnianie pola `userId` w kolekcji `applications`.
 *
 * Zgłoszenia wysłane przez gościa (bez logowania) trafiają do Firestore z
 * `userId: null`, przez co nie pojawiają się w panelu kursanta. Ten skrypt
 * dopasowuje takie dokumenty do kont Firebase Auth po adresie e-mail i
 * dopisuje właściwy uid.
 *
 * Poświadczenia: FIREBASE_SERVICE_ACCOUNT_JSON lub FIREBASE_PRIVATE_KEY +
 * FIREBASE_CLIENT_EMAIL + FIREBASE_PROJECT_ID albo GOOGLE_APPLICATION_CREDENTIALS.
 *
 * Użycie:
 *   npm run backfill:applications
 *   npm run backfill:applications -- --dry-run
 *   npm run backfill:applications -- --email=kursant@example.com
 */

const COLLECTION = "applications";

/* ── Argumenty poleceń ─────────────────────────────────────── */
const args = process.argv.slice(2);
const flag = (name) => {
  const match = args.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3) : null;
};

const dryRun = args.includes("--dry-run");
const emailFilter = flag("email")?.trim().toLowerCase() ?? null;

/* ── Poświadczenia Firebase Admin SDK ──────────────────────── */
function readServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return {
      project_id: FIREBASE_PROJECT_ID,
      client_email: FIREBASE_CLIENT_EMAIL,
      private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }
  return null;
}

const projectId =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  readServiceAccount()?.project_id;

if (!projectId) {
  console.error(
    "Brak projektu Firebase. Ustaw FIREBASE_PROJECT_ID (patrz .env.example).",
  );
  process.exit(1);
}

/* ── Inicjalizacja Firebase Admin SDK ──────────────────────── */
const { initializeApp, cert, getApps } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");
const { getAuth } = await import("firebase-admin/auth");

if (getApps().length === 0) {
  const serviceAccount = readServiceAccount();
  initializeApp(
    serviceAccount
      ? {
          credential: cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key,
          }),
        }
      : {},
  );
}

const db = getFirestore();
const auth = getAuth();

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const isOrphaned = (data) => {
  const userId = data.userId;
  return userId === null || userId === undefined || userId === "";
};

console.log(`Projekt Firebase: ${projectId}`);
console.log(`Tryb:             ${dryRun ? "podgląd (dry-run)" : "zapis"}`);
if (emailFilter) console.log(`Filtr e-mail:     ${emailFilter}`);

const snapshot = await db.collection(COLLECTION).get();
const candidates = snapshot.docs.filter((document) => {
  const data = document.data();
  if (!isOrphaned(data)) return false;
  if (emailFilter && normalizeEmail(data.email) !== emailFilter) return false;
  return true;
});

console.log(
  `Zgłoszeń bez userId: ${candidates.length} z ${snapshot.size} dokumentów.`,
);

if (candidates.length === 0) {
  console.log("Nic do zrobienia.");
  await db.terminate();
  process.exit(0);
}

/** Cache: e-mail → uid (albo null, gdy konto nie istnieje). */
const uidByEmail = new Map();

async function resolveUid(email) {
  if (uidByEmail.has(email)) return uidByEmail.get(email);
  try {
    const user = await auth.getUserByEmail(email);
    uidByEmail.set(email, user.uid);
    return user.uid;
  } catch {
    uidByEmail.set(email, null);
    return null;
  }
}

let linked = 0;
const unmatchedEmails = new Set();

for (const document of candidates) {
  const data = document.data();
  const email = normalizeEmail(data.email);

  if (!email) {
    unmatchedEmails.add("(brak e-maila)");
    continue;
  }

  const uid = await resolveUid(email);
  if (!uid) {
    unmatchedEmails.add(email);
    continue;
  }

  if (dryRun) {
    console.log(`  ~ ${COLLECTION}/${document.id} → ${uid} (${email})`);
    linked += 1;
    continue;
  }

  await document.ref.update({ userId: uid });
  console.log(`  + ${COLLECTION}/${document.id} → ${uid} (${email})`);
  linked += 1;
}

if (unmatchedEmails.size > 0) {
  console.warn("\nBrak konta Firebase Auth dla adresów:");
  for (const email of unmatchedEmails) console.warn(`  ! ${email}`);
}

console.log(
  dryRun
    ? `Podgląd zakończony — dopasowano ${linked} dokument(y), nic nie zapisano.`
    : `Powiązano ${linked} dokument(y).`,
);

await db.terminate();
process.exit(0);
