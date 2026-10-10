"use server";

/**
 * Server Action panelu administracyjnego `/dashboard`.
 *
 * Dane wszystkich kolekcji są pobierane po stronie serwera przez Firebase
 * Admin SDK, który pomija reguły Firestore. Dlatego dostęp jest warunkowany
 * tutaj: żądanie musi pochodzić ze zweryfikowanego tokenu ID konta
 * administracyjnego (claim `admin: true` albo adres z `ADMIN_EMAIL`).
 * Klient otrzymuje wyłącznie zagregowany widok — nigdy surowych dokumentów
 * przypisanych do innych kursantów spoza zakresu panelu.
 */

import type { QuerySnapshot } from "firebase-admin/firestore";
import {
  FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE,
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyUserIdToken,
} from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  type ApplicationDoc,
  type ContactMessageDoc,
  type CourseDoc,
  type EnrollmentDoc,
  type LessonDoc,
  type UserProfile,
} from "@/lib/firebase/collections";
import {
  buildAdminOverview,
  isAdminEmail,
  type AdminOverview,
} from "@/lib/dashboard";

/** Wynik pobrania danych panelu administracyjnego. */
export interface AdminOverviewResult {
  ok: boolean;
  code: "ok" | "unauthorized" | "not_configured" | "error";
  message: string;
  data: AdminOverview | null;
}

/** Dokumenty kolekcji z doklejonym identyfikatorem dokumentu. */
function readDocuments<T>(snapshot: QuerySnapshot): T[] {
  return snapshot.docs.map(
    (document) =>
      ({ ...document.data(), id: document.id }) as T,
  );
}

/**
 * Pobiera zagregowany widok panelu administracyjnego.
 * Wywoływana z komponentu klienckiego z tokenem ID zalogowanego konta.
 */
export async function fetchAdminOverview(
  idToken?: string | null,
): Promise<AdminOverviewResult> {
  if (!isFirebaseAdminConfigured()) {
    return {
      ok: false,
      code: "not_configured",
      message: FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE,
      data: null,
    };
  }

  // ── 1. Weryfikacja tożsamości i uprawnień ──
  const author = await verifyUserIdToken(idToken);
  if (!author) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Musisz być zalogowany, aby zobaczyć panel administracyjny.",
      data: null,
    };
  }
  if (!author.admin && !isAdminEmail(author.email)) {
    return {
      ok: false,
      code: "unauthorized",
      message: "To konto nie ma uprawnień administracyjnych.",
      data: null,
    };
  }

  // ── 2. Pobranie kolekcji (Admin SDK pomija reguły Firestore) ──
  try {
    const db = getAdminDb();
    const [users, courses, enrollments, applications, lessons, messages] =
      await Promise.all([
        db.collection(COLLECTIONS.users).get(),
        db.collection(COLLECTIONS.courses).get(),
        db.collection(COLLECTIONS.enrollments).get(),
        db.collection(COLLECTIONS.applications).get(),
        db.collection(COLLECTIONS.lessons).get(),
        db.collection(COLLECTIONS.contactMessages).get(),
      ]);

    const overview = buildAdminOverview({
      users: readDocuments<UserProfile>(users),
      courses: readDocuments<CourseDoc>(courses),
      enrollments: readDocuments<EnrollmentDoc>(enrollments),
      applications: readDocuments<ApplicationDoc>(applications),
      lessons: readDocuments<LessonDoc>(lessons),
      messages: readDocuments<ContactMessageDoc>(messages),
    });

    return {
      ok: true,
      code: "ok",
      message: "Dane panelu zostały pobrane.",
      data: overview,
    };
  } catch (error) {
    console.error("[dashboard] Błąd pobierania danych:", error);
    return {
      ok: false,
      code: "error",
      message:
        "Nie udało się pobrać danych panelu. Spróbuj ponownie za chwilę.",
      data: null,
    };
  }
}
