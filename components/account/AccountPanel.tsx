"use client";

/**
 * Panel kursanta — chroniony widok dostępny pod `/account`.
 *
 * Dane pobierane są bezpośrednio z Firestore (klient SDK) po stronie klienta.
 * Reguły bezpieczeństwa gwarantują, że użytkownik widzi wyłącznie
 * dokumenty przypisane do własnego uid.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  COLLECTIONS,
  type ApplicationDoc,
  type ContactMessageDoc,
  type LessonDoc,
} from "@/lib/firebase/collections";
import { translateFirebaseError } from "@/lib/firebase/errors";
import AccountStats from "./AccountStats";
import ProfileCard from "./ProfileCard";
import ApplicationsList from "./ApplicationsList";
import LessonsList from "./LessonsList";
import MessagesList from "./MessagesList";

/** Pobiera dokumenty kolekcji, w których pole `userId` równa się uid użytkownika. */
async function fetchOwnDocuments<T>(
  collectionName: string,
  uid: string,
): Promise<T[]> {
  const db = getFirebaseDb();
  const snapshot = await getDocs(
    query(collection(db, collectionName), where("userId", "==", uid)),
  );
  return snapshot.docs.map((document) => document.data() as T);
}

function initialsFrom(source: string): string {
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return "K";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface OwnData {
  uid: string;
  applications: ApplicationDoc[];
  messages: ContactMessageDoc[];
  lessons: LessonDoc[];
}

/** Pobiera i sortuje wszystkie dokumenty należące do użytkownika. */
async function fetchOwnData(uid: string): Promise<OwnData> {
  const [applications, messages, lessons] = await Promise.all([
    fetchOwnDocuments<ApplicationDoc>(COLLECTIONS.applications, uid),
    fetchOwnDocuments<ContactMessageDoc>(COLLECTIONS.contactMessages, uid),
    fetchOwnDocuments<LessonDoc>(COLLECTIONS.lessons, uid),
  ]);

  return {
    uid,
    applications: applications.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    messages: messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    lessons: lessons.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  };
}

export default function AccountPanel() {
  const router = useRouter();
  const { user, profile, loading, configured, logout } = useAuth();

  // Dane przypisane do uid — dzięki temu po wylogowaniu nie są widoczne
  // dane poprzedniego konta (wyliczane z poniższego stanu, nie czyszczone efektem).
  const [dataEntry, setDataEntry] = useState<OwnData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* ── Przekierowanie niezalogowanych użytkowników ───────────── */
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/account");
    }
  }, [loading, user, router]);

  /* ── Pobranie danych z Firestore ───────────────────────────── */
  // Efekt podpisuje się pod wynikiem zapytania — aktualizacje stanu
  // następują w callbackach (po odpowiedzi serwera), nie w trakcie renderu.
  useEffect(() => {
    if (!user || !configured) return;

    let cancelled = false;
    fetchOwnData(user.uid).then(
      (entry) => {
        if (cancelled) return;
        setDataEntry(entry);
        setFetchError(null);
      },
      (error: unknown) => {
        if (cancelled) return;
        setFetchError(translateFirebaseError(error));
      },
    );

    return () => {
      cancelled = true;
    };
  }, [user, configured]);

  /** Ręczne odświeżenie danych (przycisk w nagłówku panelu). */
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setDataEntry(await fetchOwnData(user.uid));
      setFetchError(null);
    } catch (error) {
      setFetchError(translateFirebaseError(error));
    }
  }, [user]);

  /* ── Dane należące do aktualnie zalogowanego konta ──────────── */
  const ownData =
    dataEntry && user && dataEntry.uid === user.uid ? dataEntry : null;
  const applications = ownData?.applications ?? [];
  const messages = ownData?.messages ?? [];
  const lessons = ownData?.lessons ?? [];
  const isLoadingData = Boolean(user) && !ownData && !fetchError;
  const dataError = fetchError;

  /* ── Stany przejściowe ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
        <div className="h-28 w-full animate-pulse rounded-3xl bg-muted" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-3xl bg-muted lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-14 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Przekierowywanie do logowania…
        </p>
      </div>
    );
  }

  const displayName = profile?.displayName || user.displayName || "";
  const displayLabel = displayName || user.email || "Kursant";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
      {/* ── NAGŁÓWEK PANELU ── */}
      <header className="flex flex-col gap-5 rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-700 to-blue-500 text-lg font-black text-white shadow-md shadow-blue-500/25"
          >
            {initialsFrom(displayLabel)}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Panel kursanta
            </p>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              {displayLabel}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Konto zweryfikowane
          </span>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={isLoadingData}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
          >
            <RefreshCw
              className={`size-3.5 ${isLoadingData ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Odśwież
          </button>

          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            Wyloguj
          </button>
        </div>
      </header>

      {!configured ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-800 dark:text-amber-300"
        >
          Firebase nie jest skonfigurowany w tym środowisku — dane poniżej mogą
          być niepełne. Uzupełnij plik <code>.env.local</code>.
        </p>
      ) : null}

      {dataError ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs leading-relaxed text-red-600 dark:text-red-300"
        >
          {dataError}
        </p>
      ) : null}

      {/* ── STATYSTYKI ── */}
      <AccountStats
        applications={applications}
        lessons={lessons}
        messages={messages}
        isLoading={isLoadingData}
      />

      {/* ── GŁÓWNA SIATKA SEKCJI ── */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ApplicationsList applications={applications} isLoading={isLoadingData} />
          <LessonsList lessons={lessons} isLoading={isLoadingData} />
          <MessagesList messages={messages} isLoading={isLoadingData} />
        </div>

        <div className="space-y-6">
          <ProfileCard />
          <div className="rounded-3xl border border-border/80 bg-card p-5 text-xs leading-relaxed text-muted-foreground shadow-xs">
            <p className="font-bold text-foreground">Potrzebujesz pomocy?</p>
            <p className="mt-1.5">
              Koordynator odbiera telefon od poniedziałku do soboty.
            </p>
            <a
              href="tel:+48573219230"
              className="mt-3 inline-flex items-center gap-2 font-semibold text-blue-700 hover:underline dark:text-blue-300"
            >
              +48 573 219 230
            </a>
            <p className="mt-3">
              lub{" "}
              <Link
                href="/contact"
                className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
              >
                napisz przez formularz kontaktowy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
