"use client";

/**
 * Lejek zgłoszeń i skrzynka wiadomości w panelu administracyjnym.
 *
 * Zgłoszenia (wnioski o szkolenie) są grupowane według statusu — widok
 * pozwala szybko ocenić, ile nowych kontaktów wymaga obsługi. Poniżej
 * znajdują się ostatnie wiadomości z formularza kontaktowego.
 */

import { Inbox, MessagesSquare, Send } from "lucide-react";
import Link from "next/link";
import {
  APPLICATION_STATUS_CLASS,
  APPLICATION_STATUS_LABEL,
  CONTACT_STATUS_LABEL,
  formatIsoDate,
  type ApplicationDoc,
  type ApplicationStatus,
  type ContactMessageDoc,
} from "@/lib/firebase/collections";

interface ApplicationsFeedProps {
  applications: ApplicationDoc[];
  messages: ContactMessageDoc[];
  isLoading: boolean;
}

/** Kolejność lejka — od najświeższego kontaktu do zamkniętej sprawy. */
const PIPELINE_ORDER: ApplicationStatus[] = [
  "nowy",
  "w_realizacji",
  "potwierdzony",
  "zakonczony",
  "odrzucony",
];

export default function ApplicationsFeed({
  applications,
  messages,
  isLoading,
}: ApplicationsFeedProps) {
  const counts = PIPELINE_ORDER.map((status) => ({
    status,
    count: applications.filter((application) => application.status === status)
      .length,
  }));

  return (
    <section
      aria-label="Zgłoszenia i wiadomości"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <Inbox
            className="size-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-foreground">
            Zgłoszenia i skrzynka
          </h2>
        </div>
      </header>

      {/* ── LEJEK ZGŁOSZEŃ ── */}
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Lejek zgłoszeń
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {counts.map((entry) => (
            <li
              key={entry.status}
              className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2"
            >
              <p className="text-lg font-black text-foreground">
                {isLoading ? "…" : entry.count}
              </p>
              <p className="text-[10px] leading-tight text-muted-foreground">
                {APPLICATION_STATUS_LABEL[entry.status]}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* ── OSTATNIE ZGŁOSZENIA ── */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ostatnie zgłoszenia
          </p>
          <Link
            href="/application"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline dark:text-blue-300"
          >
            Formularz
            <Send className="size-3" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-3 space-y-2">
            {[0, 1].map((index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-center text-[11px] leading-relaxed text-muted-foreground">
            Brak zgłoszeń — pojawią się tutaj tuż po wysłaniu formularza
            przez kursanta.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {applications.map((application) => (
              <li
                key={application.id}
                className="rounded-2xl border border-border/70 bg-muted/30 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {application.fullName}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {application.categoryLabel} •{" "}
                      <span className="font-mono">{application.reference}</span>
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      APPLICATION_STATUS_CLASS[application.status] ??
                      APPLICATION_STATUS_CLASS.nowy
                    }`}
                  >
                    {APPLICATION_STATUS_LABEL[application.status] ?? "Nowe"}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatIsoDate(application.createdAt)} • {application.phone}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── SKRZYNKA WIADOMOŚCI ── */}
      <div className="mt-5 border-t border-border/60 pt-4">
        <div className="flex items-center gap-2">
          <MessagesSquare
            className="size-4 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ostatnie wiadomości
          </p>
        </div>

        {isLoading ? (
          <div className="mt-3 space-y-2">
            {[0, 1].map((index) => (
              <div key={index} className="h-12 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-center text-[11px] leading-relaxed text-muted-foreground">
            Skrzynka jest pusta — wszystkie wiadomości zostały obsłużone.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {messages.map((message) => (
              <li
                key={message.id}
                className="rounded-2xl border border-border/70 bg-muted/30 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-bold text-foreground">
                    {message.fullName}
                  </p>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {CONTACT_STATUS_LABEL[message.status] ?? "Nowa"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {message.message}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {message.topicLabel} • {formatIsoDate(message.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
