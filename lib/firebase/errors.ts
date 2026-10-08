/**
 * Tłumaczenie kodów błędów Firebase (Auth i Firestore) na czytelne
 * komunikaty wyświetlane użytkownikowi w interfejsie.
 */

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Nieprawidłowy format adresu e-mail.",
  "auth/missing-email": "Wpisz adres e-mail.",
  "auth/missing-password": "Wpisz hasło.",
  "auth/invalid-password": "Hasło musi mieć co najmniej 8 znaków.",
  "auth/weak-password":
    "Hasło jest zbyt słabe — użyj co najmniej 8 znaków, cyfr i liter.",
  "auth/user-disabled": "To konto zostało wyłączone przez administratora.",
  "auth/user-not-found": "Nie znaleziono konta z takim adresem e-mail.",
  "auth/wrong-password": "Nieprawidłowe hasło. Spróbuj ponownie.",
  "auth/invalid-credential": "Nieprawidłowy e-mail lub hasło.",
  "auth/invalid-login-credentials": "Nieprawidłowy e-mail lub hasło.",
  "auth/email-already-in-use": "Konto z tym adresem e-mail już istnieje.",
  "auth/too-many-requests":
    "Zbyt wiele nieudanych prób. Poczekaj chwilę i spróbuj ponownie.",
  "auth/network-request-failed":
    "Brak połączenia z siecią. Sprawdź swoje internet.",
  "auth/operation-not-allowed":
    "Ta metoda logowania jest wyłączona w konsoli Firebase (Authentication → Sign-in method).",
  "auth/popup-blocked":
    "Przeglądarka zablokowała okno logowania. Zezwól na wyskakujące okna i spróbuj ponownie.",
  "auth/popup-closed-by-user":
    "Okno logowania zostało zamknięte przed ukończeniem. Spróbuj ponownie.",
  "auth/cancelled-popup-request":
    "Okno logowania zostało zamknięte przed ukończeniem. Spróbuj ponownie.",
  "auth/account-exists-with-different-credential":
    "Konto z tym adresem e-mail już istnieje i używa innej metody logowania. Zaloguj się hasłem, a potem spróbuj ponownie przez Google.",
  "auth/credential-already-in-use":
    "To konto Google jest już powiązane z innym kontem w aplikacji.",
  "auth/invalid-api-key":
    "Nieprawidłowy klucz API Firebase — sprawdź zmienne NEXT_PUBLIC_FIREBASE_* w pliku .env.local.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key":
    "Nieprawidłowy klucz API Firebase — sprawdź zmienne NEXT_PUBLIC_FIREBASE_* w pliku .env.local.",
  "auth/requires-recent-login":
    "Z tej czynności musisz skorzystać ponownie po ponownym zalogowaniu.",
  "auth/unauthorized-domain":
    "Domena tej strony nie jest dozwolona w ustawieniach Firebase (Authentication → Settings → Authorized domains).",
};

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied":
    "Brak uprawnień do tej operacji. Zaloguj się ponownie i spróbuj jeszcze raz.",
  "unavailable":
    "Serwer Firestore jest chwilowo niedostępny. Spróbuj ponownie za chwilę.",
  "failed-precondition":
    "Operacja wymaga wcześniejszego przygotowania. Odśwież stronę i spróbuj ponownie.",
  "aborted": "Operacja została przerwana. Spróbuj ponownie.",
  "resource-exhausted": "Osiągnięto limit zapytań. Spróbuj ponownie później.",
  "deadline-exceeded": "Przekroczono czas oczekiwania na odpowiedź.",
};

/** Zwraca polski komunikat dla błędu Firebase albo generyczną informację. */
export function translateFirebaseError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  if (!code) {
    if (error instanceof Error && error.message) return error.message;
    return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
  }

  return (
    AUTH_ERROR_MESSAGES[code] ??
    FIRESTORE_ERROR_MESSAGES[code] ??
    "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."
  );
}
