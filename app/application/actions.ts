"use server";

/**
 * Server Action: zapis zgłoszenia (wniosku o szkolenie) do kolekcji
 * `applications` w Firestore.
 *
 * Weryfikacja danych (Zod) i zapis odbywają się po stronie serwera przy użyciu
 * Firebase Admin SDK, który pomija reguły Firestore — dzięki temu klient nie
 * może podstawić własnego statusu ani przypisać dokumentu innemu użytkownikowi.
 */

import applicationData from "@/public/data/application-data.json";
import {
  applicationSchema,
  type ApplicationData,
  type ApplicationFormValues,
} from "@/lib/application";
import {
  FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE,
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyUserIdToken,
} from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  type ApplicationDoc,
  type SubmitResult,
} from "@/lib/firebase/collections";

const data = applicationData as ApplicationData;

/** Numer referencyjny w formacie APX-XXXX (wyliczany z id dokumentu). */
function buildReference(documentId: string): string {
  const tail = documentId.replace(/[^a-zA-Z0-9]/g, "").slice(-4);
  return `APX-${tail.toUpperCase().padStart(4, "0")}`;
}

export async function submitApplication(
  values: ApplicationFormValues,
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
  const validation = applicationSchema.safeParse(values);
  if (!validation.success) {
    return {
      ok: false,
      code: "invalid",
      message:
        validation.error.issues[0]?.message ?? "Sprawdź dane formularza.",
    };
  }

  const payload = validation.data;

  // Kategoria i pora dnia muszą pochodzić z katalogu aplikacji —
  // serwer nigdy nie ufa wartościom spoza listy.
  const category = data.categories.find(
    (item) => item.id === payload.categoryId,
  );
  if (!category) {
    return {
      ok: false,
      code: "invalid",
      message: "Wybierz kategorię prawa jazdy z dostępnej listy.",
    };
  }

  const timeSlot = data.timePreferences.find(
    (item) => item.id === payload.timeSlot,
  );
  if (!timeSlot) {
    return {
      ok: false,
      code: "invalid",
      message: "Wybierz preferowaną porę dnia na jazdy.",
    };
  }

  // ── 2. Ustalenie autora (zalogowany kursant lub gość) ──
  const author = await verifyUserIdToken(idToken);

  // ── 3. Zapis dokumentu ──
  try {
    const db = getAdminDb();
    const documentRef = db.collection(COLLECTIONS.applications).doc();
    const now = new Date().toISOString();

    const document: ApplicationDoc = {
      id: documentRef.id,
      reference: buildReference(documentRef.id),
      userId: author?.uid ?? null,
      fullName: payload.fullName,
      age: payload.age,
      phone: payload.phone,
      email: payload.email.trim().toLowerCase(),
      pkkNumber: payload.pkkNumber ? payload.pkkNumber.replace(/\s/g, "") : null,
      categoryId: category.id,
      categoryLabel: category.title,
      timeSlot: timeSlot.id,
      timeSlotLabel: `${timeSlot.title} (${timeSlot.hours})`,
      status: "nowy",
      internalNote: null,
      createdAt: now,
      updatedAt: now,
    };

    await documentRef.set(document);

    return {
      ok: true,
      code: "ok",
      id: documentRef.id,
      reference: document.reference,
      message: "Zgłoszenie zostało zapisane.",
    };
  } catch (error) {
    console.error("[applications] Błąd zapisu:", error);
    return {
      ok: false,
      code: "error",
      message:
        "Nie udało się zapisać zgłoszenia. Spróbuj ponownie za chwilę lub zadzwoń: +48 573 219 230.",
    };
  }
}
