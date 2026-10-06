"use client";

/**
 * Edycja profilu kursanta — zapis do dokumentu `users/{uid}` w Firestore.
 * Reguły bezpieczeństwa pozwalają właścicielowi zmieniać wyłącznie
 * wybrane pola, bez ingerencji w rolę i adres e-mail.
 *
 * Formularz (`ProfileForm`) montuje się dopiero po pobraniu profilu,
 * dzięki czemu jego stan początkowy wynika z danych, a nie z efektu
 * synchronizującego.
 */

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Save, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { UserProfile } from "@/lib/firebase/collections";

const NAME_REGEX = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/;
const PHONE_REGEX = /^[0-9\s-+()]{9,15}$/;

function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" });
}

export default function ProfileCard() {
  const { user, profile } = useAuth();

  if (!user) {
    return null;
  }

  // Zapasowy profil z danych uwierzytelniania — obowiązuje do czasu
  // pobrania dokumentu `users/{uid}` (lacznie z przypadkiem, gdy jeszcze
  // nie powstał).
  const fallbackProfile: UserProfile = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    phone: "",
    role: "kursant",
    category: null,
    marketingConsent: false,
    createdAt: "",
    lastLoginAt: "",
  };

  const effectiveProfile = profile ?? fallbackProfile;

  return (
    <ProfileForm
      key={profile ? "profile" : "fallback"}
      profile={effectiveProfile}
      isSynced={Boolean(profile)}
    />
  );
}

interface ProfileFormProps {
  profile: UserProfile;
  isSynced: boolean;
}

function ProfileForm({ profile, isSynced }: ProfileFormProps) {
  const { user, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [phone, setPhone] = useState(profile.phone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    const nextErrors: Record<string, string> = {};
    const name = displayName.trim();
    if (name && (name.length < 3 || !NAME_REGEX.test(name))) {
      nextErrors.displayName =
        "Podaj imię i nazwisko (min. 3 znaki, same litery).";
    }
    if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
      nextErrors.phone = "Wprowadź prawidłowy numer telefonu.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    const result = await updateProfile({
      displayName: name,
      phone: phone.trim(),
    });
    setIsSaving(false);

    setNotice(
      result.ok
        ? { tone: "success", text: "Profil został zapisany." }
        : { tone: "error", text: result.message },
    );
  };

  return (
    <section
      aria-label="Dane profilu"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <UserRound
            className="size-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-foreground">Dane profilu</h2>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            isSynced
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          }`}
        >
          {isSynced ? "Zapisane" : "Uzupełnij"}
        </span>
      </header>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="profile-email"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            E-mail konta
          </label>
          <input
            id="profile-email"
            type="email"
            value={user?.email ?? ""}
            readOnly
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-border bg-muted/60 px-3.5 py-2.5 text-sm text-muted-foreground"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Adres e-mail służy do logowania — zmieniamy go w Firebase Auth.
          </p>
        </div>

        <div>
          <label
            htmlFor="profile-name"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Imię i nazwisko
          </label>
          <input
            id="profile-name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setErrors((current) => ({ ...current, displayName: "" }));
            }}
            placeholder="Jan Kowalski"
            className={`w-full rounded-xl border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.displayName ? "border-red-500" : "border-border"
            }`}
          />
          {errors.displayName ? (
            <p className="mt-1 text-xs font-medium text-red-500">
              {errors.displayName}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="profile-phone"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Numer telefonu
          </label>
          <input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setErrors((current) => ({ ...current, phone: "" }));
            }}
            placeholder="573 219 230"
            className={`w-full rounded-xl border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : "border-border"
            }`}
          />
          {errors.phone ? (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.phone}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Konto od:</span>{" "}
          {formatDate(profile.createdAt)}
          <br />
          <span className="font-semibold text-foreground">
            Ostatnie logowanie:
          </span>{" "}
          {formatDate(profile.lastLoginAt)}
        </div>

        {notice ? (
          <p
            role="status"
            className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${
              notice.tone === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"
            }`}
          >
            {notice.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            ) : null}
            <span>{notice.text}</span>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isSaving ? "Zapisywanie…" : "Zapisz zmiany"}
        </button>
      </form>
    </section>
  );
}
