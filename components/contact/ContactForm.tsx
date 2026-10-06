"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, Mail, Phone, Send, User } from "lucide-react";
import { ContactFormContent, ContactFormValues, createContactSchema } from "@/lib/contact";
import { useAuth } from "@/components/auth/AuthProvider";
import { submitContactMessage } from "@/app/contact/actions";

interface ContactFormProps {
  form: ContactFormContent;
}

const FIELD_ORDER = ["fullName", "email", "topicId", "message", "consent"] as const;

export default function ContactForm({ form }: ContactFormProps) {
  const schema = useMemo(
    () => createContactSchema(form.topics.map((topic) => topic.id)),
    [form.topics]
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [topicId, setTopicId] = useState(form.topics[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState<ContactFormValues | null>(null);

  // Zalogowany kursant — wiadomość zostanie przypisana do jego konta
  const { user, profile, getIdToken } = useAuth();

  // Jednorazowe uzupełnienie formularza danymi z profilu
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (prefilledRef.current || !profile) return;
    prefilledRef.current = true;
    setFullName((current) => current.trim() || profile.displayName);
    setEmail((current) => current.trim() || profile.email);
  }, [profile]);

  const selectedTopic = form.topics.find((topic) => topic.id === topicId) ?? form.topics[0];

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const values: ContactFormValues = {
      fullName: fullName.trim(),
      email: email.trim(),
      topicId,
      message: message.trim(),
      consent,
    };

    const result = schema.safeParse(values);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      });
      setErrors(fieldErrors);

      const firstInvalid = FIELD_ORDER.find((field) => fieldErrors[field]);
      if (firstInvalid) {
        document.getElementById(firstInvalid)?.focus();
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Token ID weryfikowany po stronie serwera (Firebase Admin SDK)
      const idToken = user ? await getIdToken() : null;
      const submitResult = await submitContactMessage(result.data, idToken);

      if (!submitResult.ok) {
        setSubmitError(submitResult.message);
        return;
      }

      setSent(result.data);
    } catch {
      setSubmitError(
        "Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setMessage("");
    setConsent(false);
    setTopicId(form.topics[0]?.id ?? "");
    setErrors({});
    setSent(null);
  };

  const inputClass = (field: string) =>
    `w-full rounded-xl border bg-muted/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? "border-red-500" : "border-border"
    }`;

  return (
    <div
      id="formularz"
      className="scroll-mt-28 rounded-3xl border border-border/80 bg-card p-6 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.35)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground">
          {form.title}
          <Send className="size-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </h2>
        <p className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" aria-hidden="true" />
          {form.badge}
        </p>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{form.description}</p>

      {sent ? (
        <div role="status" className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <div>
              <p className="text-base font-bold text-foreground">Wiadomość przyjęta</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Dziękujemy, <strong className="text-foreground">{sent.fullName}</strong>. Koordynator
                odezwie się na{" "}
                <strong className="text-foreground">{sent.email}</strong> w ciągu 30 minut
                w sprawie: {selectedTopic?.label ?? "Twojego pytania"}.
              </p>
            </div>
          </div>

          <a
            href="tel:+48573219230"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
          >
            <Phone className="size-4" aria-hidden="true" />
            Jeśli sprawa jest pilna, zadzwoń: +48 573 219 230
          </a>

          <button
            type="button"
            onClick={resetForm}
            className="mt-5 inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Wyślij kolejną wiadomość
          </button>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                Imię i Nazwisko
              </label>
              <span className="text-[11px] text-muted-foreground">Wymagane</span>
            </div>
            <div className="relative">
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  clearError("fullName");
                }}
                placeholder={form.placeholders.name}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className={`${inputClass("fullName")} pr-10`}
              />
              <User className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            </div>
            {errors.fullName ? (
              <p id="fullName-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.fullName}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Adres E-mail
              </label>
              <span className="text-[11px] text-muted-foreground">Wymagane</span>
            </div>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearError("email");
                }}
                placeholder={form.placeholders.email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`${inputClass("email")} pr-10`}
              />
              <Mail className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            </div>
            {errors.email ? (
              <p id="email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="topicId" className="mb-1.5 block text-sm font-semibold text-foreground">
              W jakiej sprawie piszesz?
            </label>
            <div className="relative">
              <select
                id="topicId"
                name="topicId"
                value={topicId}
                onChange={(event) => {
                  setTopicId(event.target.value);
                  clearError("topicId");
                }}
                aria-invalid={Boolean(errors.topicId)}
                aria-describedby={errors.topicId ? "topicId-error" : "topicId-hint"}
                className={`${inputClass("topicId")} appearance-none pr-10`}
              >
                {form.topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            </div>
            {selectedTopic ? (
              <p id="topicId-hint" className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {selectedTopic.hint}
              </p>
            ) : null}
            {errors.topicId ? (
              <p id="topicId-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.topicId}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="message" className="text-sm font-semibold text-foreground">
                Wiadomość
              </label>
              <span className="text-[11px] text-muted-foreground">
                {message.length > 0 ? `${message.length}/1000` : "Szczegóły"}
              </span>
            </div>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                clearError("message");
              }}
              placeholder={form.placeholders.message}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
              className={`${inputClass("message")} min-h-32 resize-y`}
            />
            {errors.message ? (
              <p id="message-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="consent" className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  clearError("consent");
                }}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "consent-error" : undefined}
                className="mt-0.5 size-4 shrink-0 rounded border-border text-blue-700 focus:ring-2 focus:ring-blue-500"
              />
              <span>
                {form.consentLead}{" "}
                <a
                  href="#polityka"
                  className="font-semibold text-foreground underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {form.consentLinkLabel}
                </a>
                .
              </span>
            </label>
            {errors.consent ? (
              <p id="consent-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.consent}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-relaxed text-red-600 dark:text-red-300"
            >
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Wysyłanie…" : form.submitLabel}
            {!isSubmitting ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
          </button>
        </form>
      )}
    </div>
  );
}
