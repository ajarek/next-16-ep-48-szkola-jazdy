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
  /** Katalog kursów oferowanych przez szkołę (wspólny dla wszystkich). */
  courses: "courses",
  /** Zapisy (zakupy) kursów powiązane z kontem kursanta przez `userId`. */
  enrollments: "enrollments",
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

/** Status zapisu (zakupu) kursu przez kursanta. */
export type EnrollmentStatus = "w_realizacji" | "zakonczony" | "anulowany";

/** Grupa katalogowa kursu — odpowiada filtrom na stronie `/categories`. */
export type CourseGroup = "passenger" | "heavy" | "bus";

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

/**
 * Kurs z katalogu — dokument `courses/{id}`.
 *
 * Wpis jest wspólny dla wszystkich użytkowników (bez pola `userId`) —
 * to źródło prawdy o ofercie, z którego korzysta panel kursanta
 * po połączeniu z kolekcją `enrollments`.
 */
export interface CourseDoc {
  id: string;
  /** Kod kategorii, np. „B”, „C+E”. */
  code: string;
  title: string;
  description: string;
  group: CourseGroup;
  /** Identyfikator katalogowy z danych aplikacji, np. `cat-b`. */
  categoryId: string;
  /**
   * Etykieta zgodna z polem `lessons.category` — dzięki temu kurs
   * można połączyć z zajęciami kursanta (harmonogram jazd).
   */
  categoryLabel: string;
  price: number;
  installmentFrom: number;
  /** Czas trwania szkolenia w formacie czytelnym, np. „3,5 miesiąca”. */
  durationLabel: string;
  theoryHours: number;
  practiceHours: number;
  /** Program kursu (moduły tematyczne). */
  modules: string[];
  image: string;
  imageAlt: string;
  active: boolean;
  createdAt: string;
}

/**
 * Zapis (zakup) kursu — dokument `enrollments/{id}`.
 *
 * Łączy kolekcję `courses` z kontem kursanta: pole `userId` wskazuje
 * dokument `users/{uid}`, a `courseId` — wpis w katalogu `courses`.
 * Zapis wyłącznie po stronie serwera (Server Action + Admin SDK).
 */
export interface EnrollmentDoc {
  id: string;
  /** Czytelny numer zapisu pokazany użytkownikowi, np. ZAP-4821. */
  reference: string;
  /** Właściciel zapisu — identyfikator dokumentu `users/{uid}`. */
  userId: string;
  courseId: string;
  /** Skopiowane z katalogu — wyświetlane bez zapytania do `courses`. */
  courseCode: string;
  courseTitle: string;
  /** Kopia `courses.categoryLabel` — połączenie z zajęciami (`lessons`). */
  categoryLabel: string;
  price: number;
  /** Ile rat — 1 oznacza płatność jednorazową. */
  installments: number;
  status: EnrollmentStatus;
  /** Zapisany postęp (0–1) — pomocniczy, gdy brak zajęć do wyliczenia. */
  progress: number;
  enrolledAt: string;
  updatedAt: string;
  completedAt: string | null;
}

/** Etykiety statusów zapisów na kurs. */
export const ENROLLMENT_STATUS_LABEL: Record<EnrollmentStatus, string> = {
  w_realizacji: "W realizacji",
  zakonczony: "Zakończony",
  anulowany: "Anulowany",
};

/** Kolory (klasy Tailwind) przypisane do statusów zapisów. */
export const ENROLLMENT_STATUS_CLASS: Record<EnrollmentStatus, string> = {
  w_realizacji:
    "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300",
  zakonczony:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  anulowany:
    "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-300",
};

/**
 * Podsumowanie jazd powiązanych z kursem (po `categoryLabel` i typie
 * „jazda”) — służy do wyliczenia postępu i licznika w panelu kursanta.
 */
export function summarizeEnrollmentDrives(
  enrollment: EnrollmentDoc,
  lessons: LessonDoc[],
): { completed: number; total: number } {
  const drives = lessons.filter(
    (lesson) =>
      lesson.type === "jazda" && lesson.category === enrollment.categoryLabel,
  );
  return {
    completed: drives.filter((lesson) => lesson.status === "zaliczone").length,
    total: drives.length,
  };
}

/**
 * Wylicza postęp kursu: na podstawie zaliczonych jazd powiązanych
 * z kursem (po `categoryLabel`), a gdy ich brak — z zapisanego
 * w dokumencie pola `progress`.
 */
export function computeEnrollmentProgress(
  enrollment: EnrollmentDoc,
  lessons: LessonDoc[],
): number {
  const { completed, total } = summarizeEnrollmentDrives(enrollment, lessons);

  if (total > 0) {
    return completed / total;
  }

  return Math.min(Math.max(enrollment.progress, 0), 1);
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
