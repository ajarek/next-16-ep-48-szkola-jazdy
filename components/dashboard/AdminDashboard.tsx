"use client";

/**
 * Panel administracyjny `/dashboard` — zagregowany widok szkoły jazdy:
 * kursy, kursanci, zapisy, płatności, zgłoszenia i wiadomości.
 *
 * Dane pobierane są Server Actionem `fetchAdminOverview`, który:
 *  1. weryfikuje token ID Firebase przekazany z klienta,
 *  2. dopuszcza wyłącznie konto administracyjne (claim `admin`
 *     albo adres z `ADMIN_EMAIL`),
 *  3. czyta wszystkie kolekcje przez Firebase Admin SDK.
 *
 * Klient nigdy nie pyta Firestore o cudze dokumenty — dzięki temu panel
 * działa niezależnie od reguł bezpieczeństwa, a uprawnienia egzekwuje
 * serwer.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatIsoDate } from "@/lib/firebase/collections";
import { ADMIN_EMAIL, isAdminEmail, type AdminOverview } from "@/lib/dashboard";
import { fetchAdminOverview } from "@/app/dashboard/actions";
import DashboardStats from "./DashboardStats";
import RevenueChart from "./RevenueChart";
import ApplicationsFeed from "./ApplicationsFeed";
import CoursesBoard from "./CoursesBoard";
import StudentsPanel from "./StudentsPanel";
import PaymentsPanel from "./PaymentsPanel";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, configured, logout, getIdToken } = useAuth();

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Zapobiega równoległym pobraniom (przycisk „Odśwież” + efekt montowania).
  const requestRef = useRef(0);

  const signedInAsAdmin = Boolean(user) && isAdminEmail(user?.email);

  /* ── Przekierowanie niezalogowanych użytkowników ───────────── */
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/dashboard");
    }
  }, [loading, user, router]);

  /* ── Pobranie zagregowanych danych z Server Actiona ────────── */
  const loadOverview = useCallback(async () => {
    if (!user) return;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setIsLoading(true);

    try {
      const idToken = await getIdToken();
      const result = await fetchAdminOverview(idToken);
      // Ignorujemy odpowiedź, gdy w międzyczasie rozpoczęto nowsze pobranie.
      if (requestRef.current !== requestId) return;

      if (result.ok && result.data) {
        setOverview(result.data);
        setError(null);
      } else {
        setOverview(null);
        setError(result.message);
      }
    } catch {
      if (requestRef.current !== requestId) return;
      setOverview(null);
      setError(
        "Nie udało się połączyć z serwerem. Odśwież stronę i spróbuj ponownie.",
      );
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    if (!user || !configured) return;

    let cancelled = false;
    // Uruchomienie pobrania w mikrotasku — dzięki temu żadne `setState`
    // nie wykonuje się synchronicznie w ciele efektu
    // (reguła `react-hooks/set-state-in-effect`).
    void Promise.resolve().then(() => {
      if (!cancelled) void loadOverview();
    });
    // `loadOverview` zmienia tożsamość przy każdej zmianie konta —
    // ponowne pobranie danych dotyczy wyłącznie nowego użytkownika.
    return () => {
      cancelled = true;
    };
  }, [user, configured, loadOverview]);

  /* ── Stany przejściowe ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
        <div className="h-28 w-full animate-pulse rounded-3xl bg-muted" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-muted" />
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

  if (!signedInAsAdmin) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border/80 bg-card p-8 text-center shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-black text-foreground">
            Brak uprawnień administracyjnych
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Panel administracyjny jest dostępny wyłącznie dla konta szkoły
            ({ADMIN_EMAIL}). Zalogowanemu użytkownikowi{" "}
            <span className="font-semibold text-foreground">
              {user.email ?? user.uid}
            </span>{" "}
            przysługuje zwykły panel kursanta.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <UserRound className="size-3.5" aria-hidden="true" />
              Przejdź do panelu kursanta
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.displayName || user.email || "Administrator";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
      {/* ── NAGŁÓWEK PANELU ── */}
      <header className="flex flex-col gap-5 rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-800 to-blue-500 text-blue-50 shadow-lg shadow-blue-600/25"
          >
            <LayoutDashboard className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Panel administracyjny
            </p>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              {displayName}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {overview
                ? `Dane z ${formatIsoDate(overview.generatedAt)}`
                : "Łączenie z serwerem…"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Konto administracyjne
          </span>

          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <UserRound className="size-3.5" aria-hidden="true" />
            Panel kursanta
          </Link>

          <button
            type="button"
            onClick={() => void loadOverview()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
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
          Firebase nie jest skonfigurowany w tym środowisku — panel pokazuje
          wyłącznie dane testowe. Uzupełnij plik <code>.env.local</code>.
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs leading-relaxed text-red-600 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      {/* ── STATYSTYKI ── */}
      <DashboardStats stats={overview?.stats ?? null} isLoading={isLoading} />

      {/* ── WYKRES PRZYCHODU + ZGŁOSZENIA ── */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart
            series={overview?.revenueSeries ?? []}
            isLoading={isLoading}
          />
        </div>
        <ApplicationsFeed
          applications={overview?.recentApplications ?? []}
          messages={overview?.openMessages ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* ── KURSY + KURSANCI ── */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CoursesBoard courses={overview?.courses ?? []} isLoading={isLoading} />
        </div>
        <StudentsPanel
          students={overview?.students ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* ── PŁATNOŚCI ── */}
      <div className="mt-6">
        <PaymentsPanel payments={overview?.payments ?? []} isLoading={isLoading} />
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
        Dane pobierane z Firestore po stronie serwera (Firebase Admin SDK).
        Dostęp do panelu jest ograniczony do konta administracyjnego.
      </p>
    </div>
  );
}
