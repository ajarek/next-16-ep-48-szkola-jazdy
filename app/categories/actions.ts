"use server";

/**
 * Server Action: zapis (zakup) kursu z katalogu na konto kursanta.
 *
 * Dokument zapisu trafia do kolekcji `enrollments` i łączy dwie kolekcje:
 *  - `userId` → dokument `users/{uid}` (konto kursanta),
 *  - `courseId` → dokument `courses/{courseId}` (katalog oferty).
 *
 * Weryfikacja danych i zapis odbywają się po stronie serwera przy użyciu
 * Firebase Admin SDK, który pomija reguły Firestore — dzięki temu klient
 * nie może przypisać zapisu innemu użytkownikowi ani zmienić ceny kursu.
 */

import { z } from "zod";
import applicationData from "@/public/data/application-data.json";
import categoriesData from "@/public/data/categories-data.json";
import {
  type ApplicationData,
} from "@/lib/application";
import { type CourseCategory } from "@/lib/categories";
import {
  FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE,
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyUserIdToken,
} from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  type CourseDoc,
  type EnrollmentDoc,
  type SubmitResult,
} from "@/lib/firebase/collections";

const catalog = categoriesData.categories as CourseCategory[];
const applicationCatalog = applicationData as ApplicationData;
/** Domyślna liczba rat z kalkulatora na stronie kategorii. */
const defaultInstallments = categoriesData.financing.defaultInstallments;

const enrollSchema = z.object({
  courseId: z.string().min(1, "Wybierz kurs z katalogu."),
});

/** Numer referencyjny w formacie ZAP-XXXX (wyliczany z id dokumentu). */
function buildReference(documentId: string): string {
  const tail = documentId.replace(/[^a-zA-Z0-9]/g, "").slice(-4);
  return `ZAP-${tail.toUpperCase().padStart(4, "0")}`;
}

/** Etykieta kategorii zgodna z formularzem zgłoszenia i polem `lessons.category`. */
function resolveCategoryLabel(categoryId: string, code: string): string {
  const match = applicationCatalog.categories.find(
    (item) => item.id === categoryId,
  );
  return match?.title ?? `Prawo jazdy kat. ${code}`;
}

/**
 * Buduje wpis katalogu na podstawie statycznych danych oferty.
 * Używane, gdy katalog `courses` nie został jeszcze zasiany w Firestore —
 * dzięki temu zapis na kurs działa od razu po wdrożeniu.
 */
function buildCourseFromCatalog(
  category: CourseCategory,
  courseRefId: string,
): CourseDoc {
  const categoryId = `cat-${category.id}`;
  return {
    id: courseRefId,
    code: category.code,
    title: `Prawo jazdy kat. ${category.code} — kurs podstawowy`,
    description: category.features.join(". "),
    group: category.group,
    categoryId,
    categoryLabel: resolveCategoryLabel(categoryId, category.code),
    price: category.price,
    installmentFrom: category.installmentFrom,
    durationLabel: `${category.theory} teorii • ${category.practice} praktyki`,
    theoryHours: 0,
    practiceHours: 0,
    modules: [...category.features],
    image: category.image,
    imageAlt: category.imageAlt,
    active: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Zapisuje kursanta na kurs.
 *
 * @param courseId identyfikator kursu w katalogu (np. „b”, „ce”)
 * @param idToken token ID zalogowanego kursanta (z `useAuth().getIdToken`)
 */
export async function enrollCourse(
  courseId: string,
  idToken?: string | null,
): Promise<SubmitResult> {
  if (!isFirebaseAdminConfigured()) {
    return {
      ok: false,
      code: "not_configured",
      message: FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE,
    };
  }

  // ── 1. Walidacja danych wejściowych ──
  const validation = enrollSchema.safeParse({ courseId });
  if (!validation.success) {
    return {
      ok: false,
      code: "invalid",
      message:
        validation.error.issues[0]?.message ?? "Wybierz kurs z katalogu.",
    };
  }

  // ── 2. Ustalenie autora (wymagane logowanie) ──
  const author = await verifyUserIdToken(idToken);
  if (!author) {
    return {
      ok: false,
      code: "invalid",
      message: "Musisz być zalogowany, aby zapisać się na kurs.",
    };
  }

  // Kurs musi pochodzić z katalogu oferty — serwer nigdy nie ufa
  // wartościom spoza listy.
  const category = catalog.find((item) => item.id === validation.data.courseId);
  if (!category) {
    return {
      ok: false,
      code: "invalid",
      message: "Wybierz kurs z dostępnej listy.",
    };
  }

  try {
    const db = getAdminDb();
    const now = new Date().toISOString();

    // ── 3. Kurs w katalogu `courses` (uzupełniany przy pierwszym zapisie) ──
    const courseRef = db.collection(COLLECTIONS.courses).doc(category.id);
    const courseSnapshot = await courseRef.get();

    let course: CourseDoc;
    if (courseSnapshot.exists) {
      const stored = courseSnapshot.data() as Omit<CourseDoc, "id">;
      course = { ...stored, id: courseSnapshot.id };
      if (!course.active) {
        return {
          ok: false,
          code: "invalid",
          message: "Ten kurs jest obecnie niedostępny w sprzedaży.",
        };
      }
    } else {
      course = buildCourseFromCatalog(category, courseRef.id);
      await courseRef.set(course);
    }

    // ── 4. Kontrola powtórnego zapisu (idempotencja) ──
    const existingSnapshot = await db
      .collection(COLLECTIONS.enrollments)
      .where("userId", "==", author.uid)
      .where("courseId", "==", course.id)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      const existingDoc = existingSnapshot.docs[0];
      const existing = existingDoc.data() as EnrollmentDoc;
      return {
        ok: true,
        code: "ok",
        id: existingDoc.id,
        reference: existing.reference,
        message: "Już jesteś zapisany na ten kurs.",
      };
    }

    // ── 5. Zapis dokumentu zapisu (zakupu) ──
    const documentRef = db.collection(COLLECTIONS.enrollments).doc();
    const enrollment: EnrollmentDoc = {
      id: documentRef.id,
      reference: buildReference(documentRef.id),
      userId: author.uid,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      categoryLabel: course.categoryLabel,
      price: course.price,
      installments: defaultInstallments,
      status: "w_realizacji",
      progress: 0,
      enrolledAt: now,
      updatedAt: now,
      completedAt: null,
    };

    await documentRef.set(enrollment);

    return {
      ok: true,
      code: "ok",
      id: documentRef.id,
      reference: enrollment.reference,
      message: "Zapis na kurs został potwierdzony.",
    };
  } catch (error) {
    console.error("[enrollments] Błąd zapisu:", error);
    return {
      ok: false,
      code: "error",
      message:
        "Nie udało się zapisać na kurs. Spróbuj ponownie za chwilę lub zadzwoń: +48 573 219 230.",
    };
  }
}
