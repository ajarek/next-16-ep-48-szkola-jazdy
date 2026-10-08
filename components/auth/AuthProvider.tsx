"use client";

/**
 * Globalny kontekst uwierzytelniania (Firebase Auth — e-mail/hasło).
 *
 * Provider jest montowany w `app/layout.tsx`, dzięki czemu stan zalogowania
 * jest dostępny dla Navbaru, formularzy i panelu kursanta.
 * Inicjalizacja Firebase odbywa się wyłącznie w przeglądarce (efekty),
 * więc rendering serwerowy pozostaje bezpieczny.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import {
  FIREBASE_NOT_CONFIGURED_MESSAGE,
  getFirebaseAuth,
  getFirebaseDb,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import { COLLECTIONS, type UserProfile } from "@/lib/firebase/collections";
import { translateFirebaseError } from "@/lib/firebase/errors";
import { linkApplicationsToUser } from "@/app/application/actions";

/** Wynik operacji uwierzytelniania / edycji profilu. */
export type AuthActionResult = { ok: true } | { ok: false; message: string };

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  phone: string;
  marketingConsent: boolean;
}

export interface ProfilePatch {
  displayName?: string;
  phone?: string;
  category?: string | null;
  marketingConsent?: boolean;
}

interface AuthContextValue {
  /** Zalogowany użytkownik Firebase Auth (null przed zalogowaniem). */
  user: User | null;
  /** Profil z kolekcji `users/{uid}` — null, gdy jeszcze nie powstał. */
  profile: UserProfile | null;
  /** True do momentu pierwszej odpowiedzi Firebase Auth. */
  loading: boolean;
  /** Czy zmienne NEXT_PUBLIC_FIREBASE_* są ustawione. */
  configured: boolean;
  register: (input: RegisterInput) => Promise<AuthActionResult>;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  /** Logowanie przez konto Google (Firebase Auth — provider Google). */
  loginWithGoogle: (options?: {
    /** Zgoda zaznaczona w formularzu rejestracji — zapisywana w profilu. */
    marketingConsent?: boolean;
  }) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<AuthActionResult>;
  updateProfile: (patch: ProfilePatch) => Promise<AuthActionResult>;
  /** Token ID potrzebny Server Actionom do weryfikacji po stronie serwera. */
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Ogranicza czas oczekiwania na operację Firebase.
 * Zapis profilu nie może blokować logowania ani rejestracji, nawet gdy
 * Firestore jest chwilowo niedostępny — brakujący profil odtworzy
 * efekt bootstrapu przy kolejnej wizycie.
 */
function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), ms);
      // Nie utrzymujemy procesu tylko dla samego timera.
      if (typeof timer === "object" && timer !== null && "unref" in timer) {
        (timer as { unref: () => void }).unref();
      }
    }),
  ]);
}

/** Buduje profil startowy na podstawie konta Firebase Auth. */
function buildProfile(user: User): UserProfile {
  const now = new Date().toISOString();
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    phone: "",
    role: "kursant",
    category: null,
    marketingConsent: false,
    createdAt: now,
    lastLoginAt: now,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = useMemo(() => isFirebaseConfigured(), []);

  const [user, setUser] = useState<User | null>(null);
  const [profileEntry, setProfileEntry] = useState<{
    uid: string;
    profile: UserProfile;
  } | null>(null);
  // Gdy Firebase nie jest skonfigurowany, nie czekamy na odpowiedź SDK
  // (loading = false od razu), a przy poprawnej konfiguracji czekamy na
  // pierwszą odpowiedź Firebase Auth.
  const [loading, setLoading] = useState(() => configured);

  // Zapobiega wielokrotnemu odtwarzaniu profilu dla tego samego konta.
  const bootstrappedUidRef = useRef<string | null>(null);
  // Podczas rejestracji profil zapisuje sam formularz — efekt bootstrapu
  // pomija wtedy ten kont dokumentu, aby nie nadpisać danych kursanta.
  const registrationRef = useRef(false);
  // Zapobiega wielokrotnemu dopisywaniu `userId` do zgłoszeń tego samego
  // konta w jednej sesji (akcja jest idempotentna, ale pytanie do Firestore
  // wykonujemy najwyżej raz).
  const linkedApplicationsUidRef = useRef<string | null>(null);

  /* ── Nasłuchiwanie stanu uwierzytelniania ───────────────────── */
  useEffect(() => {
    if (!configured) return;

    // `loading` startuje jako `false`, gdy brak konfiguracji — tutaj
    // jedynie podpinamy się do zewnętrznego systemu (Firebase Auth).
    return onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      // Po wylogowaniu zwalniam blokadę — przy kolejnym logowaniu akcja
      // dopisująca `userId` do zgłoszeń musi ponownie się uruchomić.
      if (!nextUser) linkedApplicationsUidRef.current = null;
    });
  }, [configured]);

  /* ── Nasłuchiwanie dokumentu profilu ────────────────────────── */
  useEffect(() => {
    if (!configured || !user) return;

    const profileRef = doc(getFirebaseDb(), COLLECTIONS.users, user.uid);
    return onSnapshot(
      profileRef,
      (snapshot) => {
        setProfileEntry(
          snapshot.exists()
            ? { uid: user.uid, profile: snapshot.data() as UserProfile }
            : null,
        );
      },
      () => setProfileEntry(null),
    );
  }, [configured, user]);

  // Profil zawsze dopasowany do aktualnego konta — po wylogowaniu
  // ani po zmianie konta nie pokazujemy danych poprzednika.
  const profile =
    profileEntry && user && profileEntry.uid === user.uid
      ? profileEntry.profile
      : null;

  /* ── Utworzenie profilu, jeśli jeszcze nie istnieje ─────────── */
  useEffect(() => {
    if (!configured || !user) return;
    if (bootstrappedUidRef.current === user.uid) return;
    if (registrationRef.current) return;
    bootstrappedUidRef.current = user.uid;

    (async () => {
      try {
        const db = getFirebaseDb();
        const profileRef = doc(db, COLLECTIONS.users, user.uid);
        const snapshot = await getDoc(profileRef);
        if (snapshot.exists()) return;
        await setDoc(profileRef, buildProfile(user));
      } catch {
        // Brak uprawnień lub chwilowy błąd sieci — profil zostanie
        // uzupełniony przy kolejnej wizycie.
      }
    })();
  }, [configured, user]);

  /* ── Powiązanie zgłoszeń wysłanych przed logowaniem ───────── */
  useEffect(() => {
    if (!configured || !user) return;
    if (linkedApplicationsUidRef.current === user.uid) return;
    linkedApplicationsUidRef.current = user.uid;

    // Brak `setState` w tym efekcie — zadanie może spokojnie przeżyć
    // odmontowanie (dwukrotne uruchomienie efektu w trybie deweloperskim).
    void (async () => {
      try {
        const idToken = await user.getIdToken();
        if (!idToken) return;
        // Zgłoszenie wysłane przez gościa ma `userId: null` — po zalogowaniu
        // (lub rejestracji) z tym samym e-mailem dopisujemy je do konta.
        await withTimeout(linkApplicationsToUser(idToken), 6000);
      } catch {
        // Brak sieci albo limit czasu — nie blokujemy sesji; powiązanie
        // zostanie ponowane przy kolejnej wizycie.
      }
    })();
  }, [configured, user]);

  /* ── Operacje ──────────────────────────────────────────────── */
  const login = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      if (!configured) return { ok: false, message: FIREBASE_NOT_CONFIGURED_MESSAGE };
      try {
        const credential = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email.trim(),
          password,
        );
        const profileRef = doc(
          getFirebaseDb(),
          COLLECTIONS.users,
          credential.user.uid,
        );
        // Merge aktualizuje wyłącznie `lastLoginAt` — reguły Firestore
        // wymagają, żeby pozostałe pola pozostały bez zmian.
        // Błąd zapisu nie blokuje logowania (konto jest już otwarte).
        try {
          await withTimeout(
            setDoc(
              profileRef,
              { lastLoginAt: new Date().toISOString() },
              { merge: true },
            ),
          );
        } catch {
          // Profil zostanie uzupełniony przy kolejnej wizycie.
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, message: translateFirebaseError(error) };
      }
    },
    [configured],
  );

  const loginWithGoogle = useCallback(
    async (options?: { marketingConsent?: boolean }): Promise<AuthActionResult> => {
      if (!configured) {
        return { ok: false, message: FIREBASE_NOT_CONFIGURED_MESSAGE };
      }
      try {
        const provider = new GoogleAuthProvider();
        // Wybór konta przy każdej próbie — użytkownik nie „przykleja się”
        // do konta Google ustawionego w przeglądarce.
        provider.setCustomParameters({ prompt: "select_account" });

        const credential = await signInWithPopup(getFirebaseAuth(), provider);
        const profileRef = doc(
          getFirebaseDb(),
          COLLECTIONS.users,
          credential.user.uid,
        );
        const consent = options?.marketingConsent === true;
        const now = new Date().toISOString();

        // Merge aktualizuje wyłącznie `lastLoginAt` — tak jak przy logowaniu
        // hasłem (reguły Firestore wymagają niezmienności pozostałych pól).
        // Wyjątek: zgoda zaznaczona przy rejestracji przez Google.
        try {
          const snapshot = await withTimeout(getDoc(profileRef));
          if (!snapshot.exists()) {
            // Konto utworzone przez Google nie ma jeszcze profilu —
            // tworzymy go od razu (jak przy rejestracji hasłem).
            await withTimeout(
              setDoc(profileRef, {
                ...buildProfile(credential.user),
                marketingConsent: consent,
              }),
            );
          } else {
            await withTimeout(
              setDoc(
                profileRef,
                consent ? { lastLoginAt: now, marketingConsent: true } : { lastLoginAt: now },
                { merge: true },
              ),
            );
          }
        } catch {
          // Profil zostanie uzupełniony przy kolejnej wizycie.
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, message: translateFirebaseError(error) };
      }
    },
    [configured],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthActionResult> => {
      if (!configured) return { ok: false, message: FIREBASE_NOT_CONFIGURED_MESSAGE };
      registrationRef.current = true;
      try {
        const credential = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          input.email.trim(),
          input.password,
        );
        await updateFirebaseProfile(credential.user, {
          displayName: input.displayName.trim(),
        });

        const now = new Date().toISOString();
        const newProfile: UserProfile = {
          uid: credential.user.uid,
          // Adres musi pokrywać się z adresem z tokena Auth
          // (wymaga tego reguła Firestore dla kolekcji `users`).
          email: credential.user.email ?? input.email.trim().toLowerCase(),
          displayName: input.displayName.trim(),
          phone: input.phone.trim(),
          role: "kursant",
          category: null,
          marketingConsent: input.marketingConsent,
          createdAt: now,
          lastLoginAt: now,
        };
        // Zapis profilu nie może zablokować rejestracji: konto jest już
        // utworzone, a brakujący profil odtworzy efekt bootstrapu.
        try {
          await withTimeout(
            setDoc(
              doc(getFirebaseDb(), COLLECTIONS.users, credential.user.uid),
              newProfile,
            ),
          );
        } catch {
          // Ignorujemy — konto działa, profil da się uzupełnić w panelu.
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, message: translateFirebaseError(error) };
      } finally {
        registrationRef.current = false;
      }
    },
    [configured],
  );

  const logout = useCallback(async () => {
    if (!configured) return;
    try {
      await signOut(getFirebaseAuth());
    } catch {
      // Zignorowanie — użytkownik i tak wróci do stanu wylogowania.
    }
    bootstrappedUidRef.current = null;
  }, [configured]);

  const sendPasswordReset = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      if (!configured) return { ok: false, message: FIREBASE_NOT_CONFIGURED_MESSAGE };
      try {
        await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
        return { ok: true };
      } catch (error) {
        return { ok: false, message: translateFirebaseError(error) };
      }
    },
    [configured],
  );

  const updateProfile = useCallback(
    async (patch: ProfilePatch): Promise<AuthActionResult> => {
      if (!configured) return { ok: false, message: FIREBASE_NOT_CONFIGURED_MESSAGE };
      if (!user) return { ok: false, message: "Musisz być zalogowany." };
      try {
        await setDoc(
          doc(getFirebaseDb(), COLLECTIONS.users, user.uid),
          { ...patch },
          { merge: true },
        );
        if (typeof patch.displayName === "string") {
          await updateFirebaseProfile(user, { displayName: patch.displayName });
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, message: translateFirebaseError(error) };
      }
    },
    [configured, user],
  );

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!configured || !user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [configured, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured,
      register,
      login,
      loginWithGoogle,
      logout,
      sendPasswordReset,
      updateProfile,
      getIdToken,
    }),
    [
      user,
      profile,
      loading,
      configured,
      register,
      login,
      loginWithGoogle,
      logout,
      sendPasswordReset,
      updateProfile,
      getIdToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook zwracający kontekst uwierzytelniania. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth musi być używany wewnątrz <AuthProvider>.");
  }
  return context;
}
