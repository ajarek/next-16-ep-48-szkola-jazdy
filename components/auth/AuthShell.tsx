import type { ReactNode } from "react";
import { CalendarCheck2, FileCheck2, MessagesSquare, Sparkles } from "lucide-react";
import applicationData from "@/public/data/application-data.json";
import type { ApplicationData } from "@/lib/application";

type AuthMode = "login" | "register";

const coordinator = (applicationData as ApplicationData).coordinator;

const COPY: Record<
  AuthMode,
  {
    badge: string;
    title: string;
    description: string;
    benefits: {
      icon: typeof CalendarCheck2;
      title: string;
      subtitle: string;
    }[];
    note: string;
  }
> = {
  login: {
    badge: "Panel kursanta",
    title: "Witaj ponownie w Szkole Jazdy",
    description:
      "Zaloguj się, aby sprawdzić terminy jazd, status zgłoszenia i wiadomości od koordynatora.",
    benefits: [
      {
        icon: CalendarCheck2,
        title: "Grafik jazd pod ręką",
        subtitle: "Najbliższe wykłady i jazdy w jednym miejscu.",
      },
      {
        icon: FileCheck2,
        title: "Status zgłoszenia na żywo",
        subtitle: "Sprawdź, na jakim etapie jest Twoje szkolenie.",
      },
      {
        icon: MessagesSquare,
        title: "Wiadomości od koordynatora",
        subtitle: "Odpowiedzi na Twoje pytania bez szukania w skrzynce.",
      },
    ],
    note: "Nie masz jeszcze konta? Rejestracja zajmuje 30 sekund.",
  },
  register: {
    badge: "Nowe konto",
    title: "Załóż konto kursanta",
    description:
      "Jedno konto do wszystkiego: zapisy na kurs, terminy jazd i kontakt z koordynatorem.",
    benefits: [
      {
        icon: Sparkles,
        title: "Szybsze zapisy",
        subtitle: "Formularz zgłoszeniowy uzupełni się danymi z profilu.",
      },
      {
        icon: CalendarCheck2,
        title: "Własny harmonogram",
        subtitle: "Postęp szkolenia i zaliczone godziny na jednym ekranie.",
      },
      {
        icon: FileCheck2,
        title: "Bezpieczne przechowywanie",
        subtitle: "Dane w Firebase zgodnie z zasadami RODO.",
      },
    ],
    note: "Masz już konto? Zaloguj się — zajmie to chwilę.",
  },
};

interface AuthShellProps {
  mode: AuthMode;
  children: ReactNode;
}

/**
 * Wspólny układ stron logowania i rejestracji.
 *
 * Jeden nagłówek `h1` w DOM; układ siatki sprawia, że na desktopie korzyści
 * i cytat koordynatora znajdują się po lewej stronie formularza, a na
 * urządzeniach mobilnych kolejność jest naturalna: nagłówek → korzyści → formularz.
 */
export default function AuthShell({ mode, children }: AuthShellProps) {
  const copy = COPY[mode];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* ── NAGŁÓWEK ── */}
        <header className="lg:col-start-1 lg:row-start-1">
          <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
            {copy.badge}
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl xl:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {copy.description}
          </p>
        </header>

        {/* ── KORZYŚCI I CYTAT KOORDYNATORA ── */}
        <section
          aria-label="Korzyści z konta kursanta"
          className="lg:col-start-1 lg:row-start-2"
        >
          <ul className="space-y-4">
            {copy.benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li
                  key={benefit.title}
                  className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-foreground">
                      {benefit.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {benefit.subtitle}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <figure className="mt-8 rounded-3xl border border-blue-500/30 bg-linear-to-b from-blue-700 to-blue-900 p-6 text-white shadow-xl shadow-blue-950/20">
            <blockquote className="text-sm leading-relaxed text-blue-50">
              &ldquo;{coordinator.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-xs font-semibold text-blue-200">
              {coordinator.name} — {coordinator.role}
            </figcaption>
          </figure>
        </section>

        {/* ── FORMULARZ ── */}
        <section className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
          {children}

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            {copy.note}
          </p>
        </section>
      </div>
    </div>
  );
}
