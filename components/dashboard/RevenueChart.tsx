"use client";

/**
 * Wykres słupkowy przychodu z zapisów z ostatnich sześciu miesięcy.
 *
 * Wykres budowany jest wyłącznie z elementów HTML/CSS (bez bibliotek
 * graficznych) i pozostaje responsywny: na wąskich ekranach słupki
 * zachowują proporcje, a etykiety miesięcy są zawsze widoczne.
 * Każdy słupek ma etykietę dla czytników ekranu (`aria-label`).
 */

import { TrendingUp } from "lucide-react";
import { formatCurrency, type RevenuePoint } from "@/lib/dashboard";

interface RevenueChartProps {
  series: RevenuePoint[];
  isLoading: boolean;
}

export default function RevenueChart({ series, isLoading }: RevenueChartProps) {
  const maxRevenue = Math.max(1, ...series.map((point) => point.revenue));
  const total = series.reduce((sum, point) => sum + point.revenue, 0);
  const currentMonth = series[series.length - 1];

  return (
    <section
      aria-label="Przychód z zapisów w ostatnich 6 miesiącach"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp
            className="size-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-foreground">
            Przychód z zapisów
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Ostatnie 6 miesięcy:{" "}
          <span className="font-bold text-foreground">
            {formatCurrency(total)}
          </span>
        </p>
      </header>

      {isLoading ? (
        <div
          aria-hidden="true"
          className="mt-6 h-56 w-full animate-pulse rounded-2xl bg-muted"
        />
      ) : series.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
          Brak danych do wykresu.
        </p>
      ) : (
        <>
          <div className="mt-6 flex h-56 items-end gap-2 sm:gap-4">
            {series.map((point) => {
              const heightPercent = Math.round(
                (point.revenue / maxRevenue) * 100,
              );
              const isCurrent = point.monthKey === currentMonth?.monthKey;

              return (
                <div
                  key={point.monthKey}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[10px] font-bold text-foreground">
                    {point.revenue > 0 ? formatCurrency(point.revenue) : ""}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 motion-reduce:transition-none ${
                      isCurrent
                        ? "bg-linear-to-t from-blue-700 to-blue-400"
                        : "bg-linear-to-t from-blue-700/60 to-blue-400/50"
                    }`}
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    role="img"
                    aria-label={`${point.label}: ${formatCurrency(point.revenue)} z ${point.enrollments} zapisów`}
                  />
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isCurrent
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-muted-foreground"
                    }`}
                  >
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 border-t border-border/60 pt-3 text-[11px] leading-relaxed text-muted-foreground">
            Bieżący miesiąc ({currentMonth?.label ?? "—"}):{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(currentMonth?.revenue ?? 0)}
            </span>{" "}
            z {currentMonth?.enrollments ?? 0} zapisów. Kwoty obejmują zapisy
            nieanulowane (jednorazowe i ratalne).
          </p>
        </>
      )}
    </section>
  );
}
