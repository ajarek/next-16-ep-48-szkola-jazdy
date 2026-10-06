/**
 * Konfiguracja Firebase Client SDK.
 *
 * Moduł jest importowany wyłącznie przez komponenty klienckie.
 * Inicjalizacja jest leniwa (lazy), dzięki czemu:
 *  - rendering serwerowy (SSR) nigdy nie dotyka API przeglądarki,
 *  - brak zmiennych środowiskowych nie rozbija budowania projektu —
 *    aplikacja zgłasza czytelny komunikat dopiero przy próbie użycia.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

/** Konfiguracja publiczna pobierana wyłącznie ze zmiennych środowiskowych. */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Klucze konfiguracji wymagane do działania Logowania przez e-mail/hasło. */
const REQUIRED_CONFIG_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
] as const;

/** Informuje, czy klient Firebase jest skonfigurowany w `.env.local`. */
export function isFirebaseConfigured(): boolean {
  return REQUIRED_CONFIG_KEYS.every((key) => {
    const value = firebaseConfig[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

/** Komunikat pokazywany użytkownikowi, gdy brakuje konfiguracji. */
export const FIREBASE_NOT_CONFIGURED_MESSAGE =
  "Firebase nie jest skonfigurowany. Uzupełnij plik .env.local zgodnie z .env.example (zmienne NEXT_PUBLIC_FIREBASE_*).";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let emulatorsConnected = false;

function assertConfigured(): void {
  if (!isFirebaseConfigured()) {
    throw new Error(FIREBASE_NOT_CONFIGURED_MESSAGE);
  }
}

/** Zwraca (i raz inicjalizuje) aplikację Firebase po stronie klienta. */
export function getFirebaseApp(): FirebaseApp {
  assertConfigured();
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  connectEmulatorsOnce(app);
  return app;
}

/** Zwraca instancję uwierzytelniania Firebase. */
export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(getFirebaseApp());
  return auth;
}

/** Zwraca instancję Firestore. */
export function getFirebaseDb(): Firestore {
  if (db) return db;
  db = getFirestore(getFirebaseApp());
  return db;
}

/**
 * Łączy SDK z lokalnymi emulatorami, gdy projekt pracuje w trybie deweloperskim.
 * Włączane zmienną NEXT_PUBLIC_FIREBASE_USE_EMULATORS=true.
 */
function connectEmulatorsOnce(target: FirebaseApp): void {
  if (emulatorsConnected) return;
  if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS !== "true") return;

  const authInstance = getAuth(target);
  const dbInstance = getFirestore(target);
  const authUrl =
    process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_AUTH_URL ??
    "http://127.0.0.1:9099";
  const firestorePort = Number(
    process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_FIRESTORE_PORT ?? 8080,
  );

  connectAuthEmulator(authInstance, authUrl, { disableWarnings: true });
  connectFirestoreEmulator(dbInstance, "127.0.0.1", firestorePort);

  emulatorsConnected = true;
}
