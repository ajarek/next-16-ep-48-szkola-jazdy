"use client";

/**
 * Formularz logowania i rejestracji (Firebase Auth — e-mail/hasło).
 * Jeden komponent obsługuje oba tryby (`mode`), aby nie duplikować logiki
 * walidacji, komunikatów błędów i przekierowań.
 */

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { FIREBASE_NOT_CONFIGURED_MESSAGE } from "@/lib/firebase/client";

type AuthMode = "login" | "register";

const NAME_REGEX = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9\s-+()]{9,15}$/;

interface AuthFormProps {
  mode: AuthMode;
}

/** Bezpieczne przekierowanie — wyłącznie na ścieżki w obrębie aplikacji. */
function safeNextPath(): string {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/account";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { user, configured, loading, login, register, sendPasswordReset } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [consent, setConsent] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  /* Już zalogowany użytkownik trafia od razu do panelu. */
  useEffect(() => {
    if (!loading && user) {
      router.replace(safeNextPath());
    }
  }, [loading, user, router]);

  const clearError = (field: string) => {
    setErrors((current) => (current[field] ? { ...current, [field]: "" } : current));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Wprowadź poprawny adres e-mail.";
    }

    if (password.length < 8) {
      nextErrors.password = "Hasło musi mieć co najmniej 8 znaków.";
    }

    if (mode === "register") {
      const name = displayName.trim();
      if (name.length < 3) {
        nextErrors.displayName = "Imię i nazwisko musi mieć minimum 3 znaki.";
      } else if (!NAME_REGEX.test(name)) {
        nextErrors.displayName = "Dozwolone są tylko litery, spacje i myślniki.";
      }

      if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
        nextErrors.phone = "Wprowadź prawidłowy numer telefonu.";
      }

      if (password !== passwordConfirm) {
        nextErrors.passwordConfirm = "Hasła nie są identyczne.";
      }

      if (!consent) {
        nextErrors.consent = "Zgoda jest wymagana, aby założyć konto.";
      }
    }

    setErrors(nextErrors);

    const order =
      mode === "register"
        ? ["displayName", "phone", "email", "password", "passwordConfirm", "consent"]
        : ["email", "password"];
    const firstInvalid = order.find((field) => nextErrors[field]);
    if (firstInvalid) document.getElementById(firstInvalid)?.focus();

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result =
        mode === "login"
          ? await login(email, password)
          : await register({
              email,
              password,
              displayName,
              phone,
              marketingConsent: consent,
            });

      if (!result.ok) {
        setNotice({ tone: "error", text: result.message });
        return;
      }

      if (mode === "login") {
        router.push(safeNextPath());
        router.refresh();
      }
      // Przy rejestracji nastąpuje automatyczne zalogowanie, co spowoduje
      // przekierowanie przez efekt nasłuchujący stanu uwierzytelniania.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrors({ email: "Wprowadź poprawny adres e-mail." });
      document.getElementById("email")?.focus();
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const result = await sendPasswordReset(email);
    setIsSubmitting(false);

    if (result.ok) {
      setNotice({
        tone: "success",
        text: `Wysłaliśmy link do zmiany hasła na adres ${email.trim()}. Sprawdź także folder spam.`,
      });
    } else {
      setNotice({ tone: "error", text: result.message });
    }
  };

  const inputClass = (field: string, withIcon: boolean) =>
    `w-full ${withIcon ? "pl-10" : ""} pr-4 py-2.5 rounded-xl bg-muted/40 border text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-background ${
      errors[field] ? "border-red-500 focus:ring-red-500" : "border-border"
    }`;

  const isLogin = mode === "login";

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      {!configured ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-800 dark:text-amber-300"
        >
          <strong className="font-bold">Brak konfiguracji Firebase.</strong>{" "}
          {FIREBASE_NOT_CONFIGURED_MESSAGE}
        </div>
      ) : null}

      {isResetMode ? (
        <>
          <h2 className="text-lg font-bold text-foreground">Resetowanie hasła</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Podaj adres e-mail konta, a wyślemy link do ustawienia nowego hasła.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleReset} noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                E-mail <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                  }}
                  placeholder="twoj@email.pl"
                  className={inputClass("email", true)}
                  required
                />
              </div>
              {errors.email ? (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>
              ) : null}
            </div>

            {notice ? (
              <p
                role="status"
                className={`rounded-xl border p-3 text-xs leading-relaxed ${
                  notice.tone === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"
                }`}
              >
                {notice.text}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-700 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Wysyłanie…" : "Wyślij link do resetowania"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsResetMode(false);
              setNotice(null);
              setErrors({});
            }}
            className="mt-5 w-full text-center text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
          >
            Wróć do logowania
          </button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-foreground">
            {isLogin ? "Zaloguj się" : "Załóż darmowe konto"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin
              ? "Użyj adresu e-mail podanego przy zapisie na kurs."
              : "Konto utworzysz w mniej niż minutę — bez opłat."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {mode === "register" ? (
              <>
                <div>
                  <label
                    htmlFor="displayName"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Imię i nazwisko <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="displayName"
                      type="text"
                      autoComplete="name"
                      value={displayName}
                      onChange={(event) => {
                        setDisplayName(event.target.value);
                        clearError("displayName");
                      }}
                      placeholder="Jan Kowalski"
                      className={inputClass("displayName", true)}
                      required
                    />
                  </div>
                  {errors.displayName ? (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.displayName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Telefon{" "}
                    <span className="font-normal text-muted-foreground">(opcjonalnie)</span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        clearError("phone");
                      }}
                      placeholder="573 219 230"
                      className={inputClass("phone", true)}
                    />
                  </div>
                  {errors.phone ? (
                    <p className="mt-1 text-xs font-medium text-red-500">{errors.phone}</p>
                  ) : null}
                </div>
              </>
            ) : null}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                E-mail <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                  }}
                  placeholder="twoj@email.pl"
                  className={inputClass("email", true)}
                  required
                />
              </div>
              {errors.email ? (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>
              ) : null}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground"
                >
                  Hasło <span className="text-red-500">*</span>
                </label>
                {isLogin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setNotice(null);
                      setErrors({});
                    }}
                    className="text-[11px] font-semibold text-blue-700 hover:underline dark:text-blue-300"
                  >
                    Nie pamiętasz hasła?
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground">min. 8 znaków</span>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError("password");
                  }}
                  placeholder="••••••••"
                  className={`${inputClass("password", true)} pr-11`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.password}</p>
              ) : null}
            </div>

            {mode === "register" ? (
              <>
                <div>
                  <label
                    htmlFor="passwordConfirm"
                    className="mb-1.5 block text-xs font-semibold text-foreground"
                  >
                    Powtórz hasło <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="passwordConfirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={passwordConfirm}
                      onChange={(event) => {
                        setPasswordConfirm(event.target.value);
                        clearError("passwordConfirm");
                      }}
                      placeholder="••••••••"
                      className={inputClass("passwordConfirm", true)}
                      required
                    />
                  </div>
                  {errors.passwordConfirm ? (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.passwordConfirm}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => {
                        setConsent(event.target.checked);
                        clearError("consent");
                      }}
                      className="mt-0.5 size-4 shrink-0 rounded border-border text-blue-700 focus:ring-2 focus:ring-blue-500"
                    />
                    <span>
                      Wyrażam zgodę na przetwarzanie moich danych w celu obsługi zapisu
                      na kurs, zgodnie z{" "}
                      <Link
                        href="/contact#polityka"
                        className="font-semibold text-foreground underline-offset-2 hover:underline"
                      >
                        polityką prywatności
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.consent ? (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.consent}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}

            {notice ? (
              <p
                role="alert"
                className={`rounded-xl border p-3 text-xs leading-relaxed ${
                  notice.tone === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"
                }`}
              >
                {notice.text}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full py-3 rounded-xl bg-blue-700 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span>Chwila…</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Zaloguj się" : "Załóż konto"}</span>
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Nie masz jeszcze konta?" : "Masz już konto?"}{" "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="font-semibold text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
            >
              {isLogin ? "Zarejestruj się" : "Zaloguj się"}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
