"use client";

/**
 * Kafle KPI panelu administracyjnego: przychód, prognoza rat, kursanci,
 * aktywne zapisy, zgłoszenia i zdawalność jazd.
 */

import {
  CalendarClock,
  Car,
  FileText,
  GraduationCap,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { formatCurrency, type DashboardStats } from "@/lib/dashboard";

interface DashboardStatsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

interface StatCardProps {
  icon: typeof Car;
  label: string;
  value: string;
  hint: string;
  progress?: number;
  tone: "blue" | "emerald" | "amber" | "violet" | "rose" | "cyan";
}

const TONES: Record<StatCardProps["tone"], string> = {
  blue: "bg-blue-600",
  emerald: "bg-emerald-600",
  amber: "bg-amber-500",
  violet: "bg-violet-600",
  rose: "bg-rose-600",
  cyan: "bg-cyan-600",
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  progress,
  tone,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-white ${TONES[tone]}`}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </div>

      <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
        {hint}
      </p>

      {typeof progress === "number" ? (
        <div className="mt-3">
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Postęp wskaźnika"
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500 motion-reduce:transition-none"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function DashboardStats({
  stats,
  isLoading,
}: DashboardStatsProps) {
  const placeholder = isLoading ? "…" : "—";
  const passRate = stats?.drivePassRate ?? 0;

  return (
    <section aria-label="Statystyki szkoły" className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Wallet}
          label="Przychód łączny"
          value={isLoading ? placeholder : formatCurrency(stats?.revenueTotal ?? 0)}
          hint={
            stats && !isLoading
              ? `Zakończone: ${formatCurrency(stats.revenueCollected)} • W toku: ${formatCurrency(stats.revenueOpen)}`
              : "Suma zapisów nieanulowanych"
          }
          tone="emerald"
        />

        <StatCard
          icon={CalendarClock}
          label="Raty / miesiąc"
          value={isLoading ? placeholder : formatCurrency(stats?.monthlyInstallments ?? 0)}
          hint="Prognoza wpłat z czynnych rat 0%"
          tone="amber"
        />

        <StatCard
          icon={Users}
          label="Kursanci"
          value={isLoading ? placeholder : String(stats?.studentsTotal ?? 0)}
          hint={
            stats && !isLoading
              ? `Nowi w tym miesiącu: ${stats.studentsNewThisMonth}`
              : "Konta zarejestrowane w systemie"
          }
          tone="violet"
        />

        <StatCard
          icon={GraduationCap}
          label="Aktywne zapisy"
          value={isLoading ? placeholder : String(stats?.enrollmentsActive ?? 0)}
          hint={
            stats && !isLoading
              ? `Wszystkie zapisy: ${stats.enrollmentsTotal}`
              : "Zapisy w toku szkolenia"
          }
          tone="blue"
        />

        <StatCard
          icon={FileText}
          label="Nowe zgłoszenia"
          value={isLoading ? placeholder : String(stats?.applicationsNew ?? 0)}
          hint={
            stats && !isLoading
              ? `Ostatnie 7 dni: ${stats.applicationsLast7Days}`
              : "Wnioski oczekujące na kontakt"
          }
          tone="rose"
        />

        <StatCard
          icon={TrendingUp}
          label="Zdawalność jazd"
          value={isLoading ? placeholder : `${Math.round(passRate * 100)}%`}
          hint={
            stats && !isLoading
              ? `Nadchodzące zajęcia: ${stats.lessonsUpcoming}`
              : "Zaliczone jazdy ze wszystkich zaliczalnych"
          }
          progress={isLoading ? undefined : passRate}
          tone="cyan"
        />
      </div>

      {!isLoading && stats ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Car className="size-3.5" aria-hidden="true" />
            Jazdy: {Math.round(stats.drivePassRate * 100)}% zaliczonych
          </span>
          <span aria-hidden="true">•</span>
          <span>Nadchodzące zajęcia: {stats.lessonsUpcoming}</span>
          <span aria-hidden="true">•</span>
          <span>Nowe wiadomości: {stats.messagesNew}</span>
        </p>
      ) : null}
    </section>
  );
}
