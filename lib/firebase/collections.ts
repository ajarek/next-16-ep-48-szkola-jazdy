/**
 * Schemat bazy danych Firebase Firestore.
 *
 * Plik zawiera wyłącznie typy, stałe i etykiety — żadnych importów Firebase,
 * dzięki czemu może być bezpiecznie używany zarówno po stronie klienta,
 * jak i serwera (a także poza aplikacją, np. w skryptach).
 */

/** Ścieżki kolekcji w Firestore. */
export const COLLECTIONS = {
  /** Profile użytkowników (dokument = identyfikator Firebase Auth). */
  users: "users",
  /** Zgłoszenia / wnioski o szkolenie wysłane z formularza. */
  applications: "applications",
  /** Wiadomości wysłane z formularza kontaktowego. */
  contactMessages: "contactMessages",
  /** Zaplanowane jazdy i wykłady przypisane do kursanta. */
  lessons: "lessons",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * Wynik Server Actiona wysyłającego formularz do Firestore.
 * Używany po stronie klienta do wyświetlenia komunikatu i numeru zgłoszenia.
 */
export interface SubmitResult {
  ok: boolean;
  code: "ok" | "not_configured" | "invalid" | "error";
  message: string;
  /** Identyfikator dokumentu w Firestore (gdy zapis się powiódł). */
  id?: string;
  /** Czytelny numer zgłoszenia, np. APX-4821. */
  reference?: string;
}

/** Role w systemie. Konto tworzone przez formularz zawsze otrzymuje rolę „kursant”. */
export type UserRole = "kursant" | "admin";

/** Status zgłoszenia (wniosku o szkolenie). */
export type ApplicationStatus =
  | "nowy"
  | "w_realizacji"
  | "potwierdzony"
  | "zakonczony"
  | "odrzucony";

/** Status wiadomości kontaktowej. */
export type ContactMessageStatus = "nowy" | "odpowiadana" | "zamknieta";

/** Status pojedynczej jazdy / wykładu. */
export type LessonStatus = "zaplanowane" | "zaliczone" | "odwolane";

/** Typ zajęcia. */
export type LessonType = "jazda" | "wyklad";

/**
 * Profil użytkownika — dokument `users/{uid}`.
 * Zapisywany po stronie klienta (własny dokument) po rejestracji.
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: UserRole;
  /** Kategoria prawa jazdy, którą użytkownik wybrał przy rejestracji lub w wniosku. */
  category: string | null;
  marketingConsent: boolean;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Zgłoszenie o szkolenie — dokument `applications/{id}`.
 * Zapisywany wyłącznie po stronie serwera (Server Action + Firebase Admin SDK).
 */
export interface ApplicationDoc {
  id: string;
  /** Czytelny numer referencyjny pokazany użytkownikowi, np. APX-4821. */
  reference: string;
  /** `null` dla zgłoszeń wysłanych przez gościa (bez logowania). */
  userId: string | null;
  fullName: string;
  age: string;
  phone: string;
  email: string;
  pkkNumber: string | null;
  categoryId: string;
  categoryLabel: string;
  timeSlot: string;
  timeSlotLabel: string;
  status: ApplicationStatus;
  /** Notatka wewnętrzna koordynatora (widoczna tylko dla administracji). */
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Wiadomość z formularza kontaktowego — dokument `contactMessages/{id}`. */
export interface ContactMessageDoc {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  topicId: string;
  topicLabel: string;
  message: string;
  consent: boolean;
  status: ContactMessageStatus;
  createdAt: string;
}

/** Pojedyncze zajęcie — dokument `lessons/{id}`. */
export interface LessonDoc {
  id: string;
  userId: string;
  type: LessonType;
  title: string;
  /** Data i godzina w formacie ISO, np. 2026-10-12T09:00:00.000Z. */
  startsAt: string;
  durationMin: number;
  instructor: string;
  category: string;
  status: LessonStatus;
}

/** Etykiety statusów wniosku do wyświetlenia w interfejsie. */
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  nowy: "Nowe zgłoszenie",
  w_realizacji: "W realizacji",
  potwierdzony: "Potwierdzone",
  zakonczony: "Zakończone",
  odrzucony: "Odrzucone",
};

/** Kolory (klasy Tailwind) przypisane do statusów wniosku. */
export const APPLICATION_STATUS_CLASS: Record<ApplicationStatus, string> = {
  nowy: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300",
  w_realizacji:
    "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300",
  potwierdzony:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  zakonczony: "bg-muted text-muted-foreground border-border",
  odrzucony: "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300",
};

/** Etykiety statusów zajęć. */
export const LESSON_STATUS_LABEL: Record<LessonStatus, string> = {
  zaplanowane: "Zaplanowane",
  zaliczone: "Zaliczone",
  odwolane: "Odwołane",
};

/** Kolory (klasy Tailwind) przypisane do statusów zajęć. */
export const LESSON_STATUS_CLASS: Record<LessonStatus, string> = {
  zaplanowane:
    "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300",
  zaliczone:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  odwolane: "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300",
};

/** Etykiety typów zajęć. */
export const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  jazda: "Jazda",
  wyklad: "Wykład",
};

/** Etykiety statusów wiadomości kontaktowej. */
export const CONTACT_STATUS_LABEL: Record<ContactMessageStatus, string> = {
  nowy: "Nowa",
  odpowiadana: "W odpowiedzi",
  zamknieta: "Zamknięta",
};

/** Formatuje datę ISO w polskim formacie, np. „12.10.2026, 09:00”. */
export function formatIsoDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

/** Formatuje samą datę (bez godziny), np. „12.10.2026”. */
export function formatIsoDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" }).format(date);
}
