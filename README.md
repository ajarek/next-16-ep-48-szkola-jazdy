# Szkoła Jazdy Kołobrzeg — serwis WWW

Nowoczesny serwis szkoły jazdy zbudowany na **Next.js 16 (App Router)**, **React 19**,
**Tailwind CSS v4** i **Firebase** (uwierzytelnianie + baza danych).

## Uruchomienie

```bash
npm install
npm run dev
```

Serwis: [http://localhost:3000](http://localhost:3000)

Dostępne skrypty:

| Komenda              | Opis                                        |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | serwer deweloperski                          |
| `npm run build`      | produkcyjna kompilacja                       |
| `npm run start`      | uruchomienie kompilacji produkcyjnej         |
| `npm run lint`       | linting (ESLint)                             |
| `npm run typecheck`  | sprawdzanie typów TypeScript                 |
| `npm run seed:firestore` | nasiono Firestore danymi przykładowymi   |

---

## Integracja z Firebase

Aplikacja korzysta z Firebase w dwóch miejscach:

| Warstwa            | SDK                     | Zastosowanie                                            |
| ------------------ | ----------------------- | ------------------------------------------------------- |
| **Klient**         | `firebase` (Web SDK)    | logowanie e-mail/hasło, odczyt własnych danych, profil  |
| **Serwer**         | `firebase-admin`        | weryfikacja tokena i zapis zgłoszeń/wiadomości (Server Actions) |

### 1. Konfiguracja projektu

1. Utwórz projekt w [Konsoli Firebase](https://console.firebase.google.com/).
2. **Authentication → Sign-in method → włącz „Email/Password”**.
3. **Firestore Database → utwórz bazę** (tryb produkcyjny, region `europe-west3`).
4. Dodaj aplikację Web i skopiuj konfigurację SDK.
5. Skopiuj szablon zmiennych i uzupełnij go:

```bash
cp .env.example .env.local
```

Zmienne klienta (prefiks `NEXT_PUBLIC_`): `NEXT_PUBLIC_FIREBASE_API_KEY`,
`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`,
`NEXT_PUBLIC_FIREBASE_APP_ID`.

Zmienne serwera (nigdy z prefiksem `NEXT_PUBLIC_`): `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — pobierzesz je z
**Ustawienia projektu → Konta serwisowe → Wygeneruj nowy klucz prywatny**.

6. **Authentication → Settings → Authorized domains** — dodaj domenę, z której
   serwis będzie obsługiwany (dla `localhost` jest na liście domyślnie).

### 2. Reguły bezpieczeństwa Firestore

Plik `firestore.rules` definiuje dostęp do kolekcji:

```bash
firebase deploy --only firestore:rules
```

Zasada nadrzędna: **zapisy merytoryczne idą przez Server Actions** (Admin SDK
pomija reguły), a klient może wyłącznie czytać **własne** dokumenty i edytować
**wybrane pola** swojego profilu (bez zmiany roli i e-maila).

### 3. Kolekcje

| Kolekcja          | Dokument            | Zapis                              | Odczyt                          |
| ----------------- | ------------------- | ---------------------------------- | ------------------------------- |
| `users`           | `users/{uid}`       | klient (po rejestracji/edycji)     | właściciel, admin               |
| `applications`    | `applications/{id}` | serwer (Server Action)             | właściciel (`userId`), admin    |
| `contactMessages` | `contactMessages/{id}` | serwer (Server Action)          | właściciel (`userId`), admin    |
| `lessons`         | `lessons/{id}`      | serwer / panel administracyjny     | właściciel (`userId`), admin    |
| `courses`         | `courses/{id}`      | serwer (uzupełnienie) / nasiono     | zalogowany użytkownik, admin    |
| `enrollments`     | `enrollments/{id}`  | serwer (Server Action)             | właściciel (`userId`), admin    |

Schemat typów i etykiety statusów: `lib/firebase/collections.ts`.

**Powiązanie kursów z kontem:** katalog `courses` jest wspólny dla wszystkich,
zaś dokument `enrollments/{id}` łączy kurs z kursantem przez pole `userId`
(wskazujące `users/{uid}`) oraz z ofertą przez `courseId`. Panel kursanta
łączy obie kolekcje i pokazuje zakupione kursy wraz z postępem wyliczanym
z zajęć (`lessons.category` = `courses.categoryLabel`).

Przykładowe dokumenty (wraz z opisem placeholderów) znajdują się w
`public/data/firebase-collections.json` — wykorzystuje je skrypt nasiona:

```bash
# najpierw zaloguj się przez /register i skopiuj uid z konsoli Firebase
npm run seed:firestore -- --uid=UID_KURSANTA
npm run seed:firestore -- --uid=UID_KURSANTA --collections=applications,lessons
npm run seed:firestore -- --uid=UID_KURSANTA --dry-run
```

### 4. Struktura kodu Firebase

```
lib/firebase/
├── client.ts        # Web SDK (Auth + Firestore), lazy init, emulatory
├── admin.ts         # Admin SDK — wyłącznie po stronie serwera
├── collections.ts   # typy, ścieżki kolekcji, etykiety statusów
└── errors.ts        # tłumaczenie kodów błędów Firebase na polski

components/auth/
├── AuthProvider.tsx # kontekst uwierzytelniania (hook useAuth)
├── AuthForm.tsx     # formularz logowania / rejestracji / resetu hasła
└── AuthShell.tsx    # wspólny układ stron uwierzytelniania

components/account/  # panel kursanta (/account)
app/login/           # logowanie
app/register/        # rejestracja
app/account/         # panel kursanta
app/application/actions.ts  # Server Action: zapis zgłoszenia
app/contact/actions.ts      # Server Action: zapis wiadomości
app/categories/actions.ts   # Server Action: zapis na kurs (enrollments)
```

### 5. Przepływ uwierzytelniania

- **Rejestracja** (`/register`): `createUserWithEmailAndPassword` → zapis
  profilu do `users/{uid}` (rola `kursant`).
- **Logowanie** (`/login`): `signInWithEmailAndPassword`, po zalogowaniu
  przekierowanie do `/account` lub strony podanej w parametrze `next`.
- **Reset hasła**: `sendPasswordResetEmail` (link wysyłany przez Firebase).
- **Panel** (`/account`): chroniony — brak sesji = przekierowanie do `/login`.
  Zalogowany użytkownik widzi zakupione kursy, zgłoszenia, harmonogram jazd,
  wiadomości i edytuje profil.
- **Katalog kursów** (`/categories`): przycisk „Zapisz się na kurs” tworzy
  zapis (zakup) w kolekcji `enrollments` — dla gościa najpierw otwiera
  stronę logowania, a po zapisie pokazuje stan posiadania kursu i link
  do panelu.
- **Formularze publiczne**: działają także bez logowania; jeśli użytkownik
  jest zalogowany, Server Action dodaje `userId` i wiąże dokument z kontem.

### 6. Emulatory (praca lokalna bez produkcyjnych danych)

Konfiguracja emulatorów znajduje się w pliku `firebase.json`.

```bash
# emulatory Auth i Firestore (wymaga zainstalowanego Javy — potrzebna dla Firestore)
npx firebase-tools emulators:start --only auth,firestore --project demo-test

# .env.local
NEXT_PUBLIC_FIREBASE_USE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-test
```

- emulator **Auth** nie wymaga Javy,
- emulator **Firestore** wymaga Javy 11+ w `PATH`,
- przy włączonych emulatorach Server Actions łączą się z nimi automatycznie
  (zmienne `FIREBASE_AUTH_EMULATOR_HOST` / `FIRESTORE_EMULATOR_HOST`) i nie
  potrzebują klucza serwisowego,
- projekt o identyfikatorze zaczynającym się od `demo-` nigdy nie łączy się
  z produkcyjnymi zasobami Firebase.

### 7. Rozwiązywanie problemów

| Komunikat                                   | Rozwiązanie                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| „Firebase nie jest skonfigurowany”          | uzupełnij `NEXT_PUBLIC_FIREBASE_*` w `.env.local`                              |
| „Firebase Admin SDK nie jest skonfigurowany”| uzupełnij `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` |
| „Brak uprawnień do tej operacji”            | wdroż najnowsze `firestore.rules` (`firebase deploy --only firestore:rules`)   |
| „Logowanie przez e-mail/hasło jest wyłączone”| Authentication → Sign-in method → Email/Password → **Enable**                  |
| „Domena tej strony nie jest dozwolona”      | Authentication → Settings → Authorized domains                                 |

---

## Struktura projektu

```
app/                  # trasy App Router (strony, akcje serwera, SEO)
components/           # komponenty UI (Navbar, sekcje, auth, panel kursanta)
lib/                  # logika domenowa, schematy Zod, Firebase
public/data/          # przykładowe dane (katalogi, schematy kolekcji)
scripts/              # skrypty narzędziowe (nasiono Firestore)
firestore.rules       # reguły bezpieczeństwa Firestore
firebase.json          # konfiguracja Firebase CLI (reguły, emulatory)
```

## Jakość kodu

Po istotnych zmianach uruchamiamy:

```bash
npm run typecheck
npm run lint
npm run build
```
