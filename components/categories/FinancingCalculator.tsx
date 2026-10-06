"use client";

import { useState, useCallback } from "react";
import { CourseCategory } from "@/lib/categories";
import { calculateInstallment, formatPrice } from "@/lib/categories";
import { ArrowRight } from "lucide-react";

interface FinancingCalculatorProps {
  categories: CourseCategory[];
  eyebrow: string;
  badge: string;
  title: string;
  description: string;
  minInstallments: number;
  maxInstallments: number;
  defaultInstallments: number;
  ticks: number[];
  defaultCategoryId: string;
}

export default function FinancingCalculator({
  categories,
  eyebrow,
  badge,
  title,
  description,
  minInstallments,
  maxInstallments,
  defaultInstallments,
  ticks,
  defaultCategoryId,
}: FinancingCalculatorProps) {
  const [selectedId, setSelectedId] = useState(defaultCategoryId);
  const [installments, setInstallments] = useState(defaultInstallments);

  const selectedCategory = categories.find((c) => c.id === selectedId) ?? categories[0];
  const monthlyPayment = calculateInstallment(selectedCategory.price, installments);

  const handleRangeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInstallments(Number(e.target.value));
    },
    []
  );

  // Procentowa pozycja suwaka
  const rangePercent =
    ((installments - minInstallments) / (maxInstallments - minInstallments)) * 100;

  return (
    <section
      aria-labelledby="financing-heading"
      className="rounded-2xl bg-card border border-border shadow-sm p-6 sm:p-8 h-full flex flex-col"
    >
      {/* Nagłówek */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
            {eyebrow}
          </p>
          <h2 id="financing-heading" className="text-xl sm:text-2xl font-black text-foreground leading-tight">
            {title}
          </h2>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
          {badge}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>

      {/* Wybór kategorii */}
      <div className="mb-5">
        <label
          htmlFor="category-select"
          className="block text-xs font-bold text-foreground mb-2"
        >
          Wybierz kurs
        </label>
        <select
          id="category-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors appearance-none"
          aria-label="Wybierz kategorię kursu"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              Kategoria {c.code} — {formatPrice(c.price)} PLN
            </option>
          ))}
        </select>
      </div>

      {/* Suwak liczby rat */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="installments-range" className="text-xs font-bold text-foreground">
            Liczba rat
          </label>
          <span className="text-sm font-black text-blue-700 dark:text-blue-400">
            {installments} rat
          </span>
        </div>

        {/* Suwak */}
        <div className="relative py-1">
          <input
            id="installments-range"
            type="range"
            min={minInstallments}
            max={maxInstallments}
            step={1}
            value={installments}
            onChange={handleRangeChange}
            aria-valuemin={minInstallments}
            aria-valuemax={maxInstallments}
            aria-valuenow={installments}
            aria-label={`Liczba rat: ${installments}`}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{
              background: `linear-gradient(to right, oklch(0.488 0.243 264.376) ${rangePercent}%, var(--border) ${rangePercent}%)`,
            }}
          />
        </div>

        {/* Ticki */}
        <div className="flex justify-between mt-1.5">
          {ticks.map((tick) => (
            <button
              key={tick}
              type="button"
              onClick={() => setInstallments(tick)}
              className={`text-[11px] font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded ${
                installments === tick
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tick} rat
            </button>
          ))}
        </div>
      </div>

      {/* Wynik kalkulacji */}
      <div className="mt-auto">
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl px-4 py-4">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
              Miesięczna rata
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-foreground">
                {formatPrice(monthlyPayment)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">zł / mc</span>
            </div>
          </div>
          <a
            href="/application"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-700/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Wybierz ten plan
            <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-3">
          Raty 0% bez odsetek • Podpisanie umowy bezpośrednio w biurze Szkoły Jazdy
        </p>
      </div>
    </section>
  );
}
