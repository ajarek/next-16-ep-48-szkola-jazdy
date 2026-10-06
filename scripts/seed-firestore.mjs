#!/usr/bin/env node
/**
 * Nasiono biblioteki Firestore przykładowymi dokumentami.

 * Źródło danych: public/data/firebase-collections.json
 * Poświadczenia: FIREBASE_SERVICE_ACCOUNT_JSON lub FIREBASE_PRIVATE_KEY +
 * FIREBASE_CLIENT_EMAIL + FIREBASE_PROJECT_ID albo GOOGLE_APPLICATION_CREDENTIALS.
 *
 * Użycie:
 *   npm run seed:firestore -- --uid=UID_KURSANTA
 *   npm run seed:firestore -- --uid=UID_KURSANTA --collections=applications,lessons
 *   npm run seed:firestore -- --uid=UID_KURSANTA --dry-run
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SAMPLE_PATH = resolve(ROOT, "public/data/firebase-collections.json");

/* ── Argumenty poleceń ─────────────────────────────────────── */
const args = process.argv.slice(2);
const flag = (name) => {
  const match = args.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3) : null;
};

const uid = flag("uid");
const onlyCollections = (flag("collections") ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const dryRun = args.includes("--dry-run");

if (!uid) {
  console.error(
    "Brak identyfikatora konta. Użyj: npm run seed:firestore -- --uid=UID_KURSANTA",
  );
  process.exit(1);
}

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

/* ── Placeholdery w danych przykładowych ───────────────────── */
function shiftDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date;
}

function resolveValue(value) {
  if (typeof value === "string") {
    return value.replace(
      /\{\{(uid|date|now)([+-]\d+)?d?\}\}/g,
      (_match, kind, offset) => {
        const shift = offset ? Number(offset) : 0;
        if (kind === "uid") return uid;

        const shifted = shiftDate(shift);
        if (kind === "date") {
          const year = shifted.getFullYear();
          const month = String(shifted.getMonth() + 1).padStart(2, "0");
          const day = String(shifted.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
        return shifted.toISOString();
      },
    );
  }

  if (Array.isArray(value)) return value.map(resolveValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, resolveValue(entry)]),
    );
  }
  return value;
}

/* ── Inicjalizacja Firebase Admin SDK ──────────────────────── */
const { initializeApp, cert, getApps } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");

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
const sample = JSON.parse(readFileSync(SAMPLE_PATH, "utf8"));
const collections = sample.collections ?? {};

const selected = Object.entries(collections).filter(
  ([name]) =>
    onlyCollections.length === 0 || onlyCollections.includes(name),
);

if (selected.length === 0) {
  console.error("Brak kolekcji do zapisania (sprawdź flagę --collections).");
  process.exit(1);
}

console.log(`Projekt Firebase: ${projectId}`);
console.log(`Konto kursanta:   ${uid}`);
console.log(`Tryb:             ${dryRun ? "podgląd (dry-run)" : "zapis"}`);

let written = 0;

for (const [collectionName, documents] of selected) {
  for (const rawDocument of documents) {
    const { id, ...data } = resolveValue(rawDocument);

    if (!id) {
      console.warn(`  ! pominięto dokument bez pola "id" w ${collectionName}`);
      continue;
    }

    if (dryRun) {
      console.log(`  ~ ${collectionName}/${id}`);
      continue;
    }

    await db.collection(collectionName).doc(id).set(data, { merge: false });
    written += 1;
    console.log(`  + ${collectionName}/${id}`);
  }
}

console.log(
  dryRun
    ? "Podgląd zakończony — nic nie zapisano."
    : `Zapisano ${written} dokument(y).`,
);

await db.terminate();
process.exit(0);
