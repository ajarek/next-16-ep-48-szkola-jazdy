"use client";

/**
 * Lista wiadomości wysłanych przez kursanta z formularza kontaktowego.
 * Dane pochodzą z kolekcji `contactMessages`.
 */

import Link from "next/link";
import { Inbox, Mail } from "lucide-react";
import {
  CONTACT_STATUS_LABEL,
  formatIsoDate,
  type ContactMessageDoc,
} from "@/lib/firebase/collections";

interface MessagesListProps {
  messages: ContactMessageDoc[];
  isLoading: boolean;
}

export default function MessagesList({ messages, isLoading }: MessagesListProps) {
  return (
    <section
      aria-label="Moje wiadomości"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Mail
            className="size-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-foreground">
            Wiadomości do szkoły
          </h2>
        </div>
        <Link
          href="/contact"
          className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          Napisz wiadomość
        </Link>
      </header>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[0, 1].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Brak wiadomości
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Wysłane z formularza kontaktowego wiadomości znajdziesz tutaj wraz
            z datą i statusem.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Przejdź do kontaktu
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className="rounded-2xl border border-border/70 bg-muted/30 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">
                  {message.topicLabel}
                </p>
                <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {CONTACT_STATUS_LABEL[message.status] ?? "Nowa"}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {message.message}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Wysłano: {formatIsoDate(message.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
