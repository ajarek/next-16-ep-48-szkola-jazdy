"use client";

/**
 * Lista zgłoszeń (wniosków) zalogowanego kursanta.
 * Dane pochodzą z kolekcji `applications`, gdzie pole `userId` = uid użytkownika.
 */

import Link from "next/link";
import { ArrowUpRight, FileText, Inbox } from "lucide-react";
import {
  APPLICATION_STATUS_CLASS,
  APPLICATION_STATUS_LABEL,
  formatIsoDate,
  type ApplicationDoc,
} from "@/lib/firebase/collections";

interface ApplicationsListProps {
  applications: ApplicationDoc[];
  isLoading: boolean;
}

export default function ApplicationsList({
  applications,
  isLoading,
}: ApplicationsListProps) {
  return (
    <section
      aria-label="Moje zgłoszenia"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">Moje zgłoszenia</h2>
        </div>
        <Link
          href="/application"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          Nowe zgłoszenie
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </header>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[0, 1].map((index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Nie masz jeszcze żadnego zgłoszenia
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Wypełnij formularz, aby zarezerwować miejsce w grupie — zajmie
            około 90 sekund.
          </p>
          <Link
            href="/application"
            className="mt-4 inline-flex items-center rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Zapisz się na kurs
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {applications.map((application) => (
            <li
              key={application.id}
              className="rounded-2xl border border-border/70 bg-muted/30 p-4 transition-colors hover:bg-muted/60"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {application.categoryLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {application.timeSlotLabel} • zgłoszenie{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {application.reference}
                    </span>
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    APPLICATION_STATUS_CLASS[application.status] ??
                    APPLICATION_STATUS_CLASS.nowy
                  }`}
                >
                  {APPLICATION_STATUS_LABEL[application.status] ?? "Nowe"}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-1 gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-foreground">Data zgłoszenia</dt>
                  <dd>{formatIsoDate(application.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Kontakt</dt>
                  <dd>{application.phone}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Numer PKK</dt>
                  <dd className="font-mono">
                    {application.pkkNumber ? application.pkkNumber : "uzupełnisz później"}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
