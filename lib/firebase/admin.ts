/**
 * Konfiguracja Firebase Admin SDK — WYŁĄCZNIE po stronie serwera.
 *
 * Nigdy nie importuj tego modułu z komponentów klienckich.
 *
 * Obsługiwane źródła poświadczeń (patrz `.env.example`):
 *  1. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *  2. FIREBASE_SERVICE_ACCOUNT_JSON (pełny klucz serwisowy jako string JSON)
 *  3. domyślne poświadczenia Google (GOOGLE_APPLICATION_CREDENTIALS / ADC)
 */

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function readServiceAccount():
  | { projectId: string; clientEmail: string; privateKey: string }
  | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson && rawJson.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawJson) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key,
        };
      }
    } catch {
      return null;
    }
    return null;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return null;
}

function hasEmulatorHost(): boolean {
  return Boolean(
    process.env.FIRESTORE_EMULATOR_HOST ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST,
  );
}

/** Czy po stronie serwera dostępne są poświadczenia Firebase Admin SDK. */
export function isFirebaseAdminConfigured(): boolean {
  if (readServiceAccount()) return true;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return true;
  // Tryb lokalny: emulatory nie wymagają klucza serwisowego.
  return hasEmulatorHost();
}

/** Komunikat pokazywany, gdy brakuje poświadczeń administracyjnych. */
export const FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE =
  "Firebase Admin SDK nie jest skonfigurowany. Uzupełnij zmienne FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL i FIREBASE_PRIVATE_KEY w pliku .env.local (patrz .env.example).";

let adminApp: App | null = null;

/** Inicjalizuje (i zwraca) aplikację Firebase Admin SDK. */
export function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }

  const serviceAccount = readServiceAccount();
  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert({
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey,
      }),
    });
    return adminApp;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    adminApp = initializeApp();
    return adminApp;
  }

  // Tryb lokalny na emulatorach — uwierzytelnianie pomijamy.
  if (hasEmulatorHost()) {
    adminApp = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID ?? "demo-szkola-jazdy",
    });
    return adminApp;
  }

  throw new Error(FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE);
}

/** Zwraca instancję uwierzytelniania Admin SDK. */
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

/** Zwraca instancję Firestore Admin SDK. */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

/** Uwierzytelniony użytkownik przesyłający żądanie do Server Action. */
export interface VerifiedUser {
  uid: string;
  email: string | null;
  /** Własny claim `admin: true` w tokenie ID (nadawany przez Admin SDK). */
  admin: boolean;
}

/**
 * Weryfikuje token ID Firebase przekazany z klienta.
 * Zwraca `null` dla żądań gościa (bez tokenu) lub gdy token jest nieprawidłowy.
 */
export async function verifyUserIdToken(
  idToken?: string | null,
): Promise<VerifiedUser | null> {
  if (!idToken || !isFirebaseAdminConfigured()) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      admin: decoded.admin === true,
    };
  } catch {
    return null;
  }
}
