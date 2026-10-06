"use server";

/**
 * Server Action: zapis wiadomości z formularza kontaktowego do kolekcji
 * `contactMessages` w Firestore.
 *
 * Analogicznie do zgłoszeń, walidacja i zapis odbywają się po stronie serwera
 * (Firebase Admin SDK), a temat musi należeć do katalogu tematów.
 */

import contactData from "@/public/data/contact-data.json";
import {
  createContactSchema,
  type ContactData,
  type ContactFormValues,
} from "@/lib/contact";
import {
  FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE,
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyUserIdToken,
} from "@/lib/firebase/admin";
import {
  COLLECTIONS,
  type ContactMessageDoc,
  type SubmitResult,
} from "@/lib/firebase/collections";

const data = contactData as ContactData;
const contactSchema = createContactSchema(data.form.topics.map((topic) => topic.id));

export async function submitContactMessage(
  values: ContactFormValues,
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
  const validation = contactSchema.safeParse(values);
  if (!validation.success) {
    return {
      ok: false,
      code: "invalid",
      message:
        validation.error.issues[0]?.message ?? "Sprawdź dane formularza.",
    };
  }

  const payload = validation.data;
  const topic = data.form.topics.find((item) => item.id === payload.topicId);
  if (!topic) {
    return {
      ok: false,
      code: "invalid",
      message: "Wybierz temat wiadomości z dostępnej listy.",
    };
  }

  // ── 2. Ustalenie autora (zalogowany kursant lub gość) ──
  const author = await verifyUserIdToken(idToken);

  // ── 3. Zapis dokumentu ──
  try {
    const db = getAdminDb();
    const documentRef = db.collection(COLLECTIONS.contactMessages).doc();

    const document: ContactMessageDoc = {
      id: documentRef.id,
      userId: author?.uid ?? null,
      fullName: payload.fullName,
      email: payload.email.trim().toLowerCase(),
      topicId: topic.id,
      topicLabel: topic.label,
      message: payload.message,
      consent: payload.consent,
      status: "nowy",
      createdAt: new Date().toISOString(),
    };

    await documentRef.set(document);

    return {
      ok: true,
      code: "ok",
      id: documentRef.id,
      message: "Wiadomość została zapisana.",
    };
  } catch (error) {
    console.error("[contactMessages] Błąd zapisu:", error);
    return {
      ok: false,
      code: "error",
      message:
        "Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę lub zadzwoń: +48 573 219 230.",
    };
  }
}
