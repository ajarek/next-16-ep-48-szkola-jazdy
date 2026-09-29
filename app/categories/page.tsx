import type { Metadata } from "next";
import { Shield } from "lucide-react";
import categoriesData from "@/public/data/categories-data.json";
import { CourseCategory, CategoryFilter } from "@/lib/categories";
import CategoryGrid from "@/components/categories/CategoryGrid";
import IncludedSection from "@/components/categories/IncludedSection";
import FinancingCalculator from "@/components/categories/FinancingCalculator";
import HelpBanner from "@/components/categories/HelpBanner";

export const metadata: Metadata = {
  title: "Kategorie i Ceny | Szkoła Jazdy Kołobrzeg",
  description:
    "Sprawdź pełny cennik kursów na prawo jazdy kategorii B, C, C+E i D w Kołobrzegu. Transparentne ceny, raty 0%, brak ukrytych kosztów paliwa. Pojazdy identyczne z WORD.",
  keywords: [
    "cennik szkoły jazdy Kołobrzeg",
    "prawo jazdy kategoria B cena",
    "kategoria C prawo jazdy",
    "kategoria CE kurs",
    "kategoria D autobus",
    "raty 0% szkoła jazdy",
  ],
  openGraph: {
    title: "Kategorie i Ceny Kursów | Szkoła Jazdy Kołobrzeg",
    description:
      "Pełny cennik kursów kat. B, C, C+E, D. Raty 0%, paliwo wliczone, pojazdy zgodne z WORD.",
    locale: "pl_PL",
    type: "website",
  },
};

export default function CategoriesPage() {
  const { hero, filters, categories, included, financing, help } = categoriesData;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-blue-100/80 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 mb-6">
          <Shield className="size-3.5" aria-hidden="true" />
          {hero.badge}
        </div>

        {/* H1 */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-foreground mb-5">
          {hero.titleLine1}
          <br />
          <span className="text-blue-700 dark:text-blue-400">{hero.titleLine2}</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {hero.description}
        </p>
      </section>

      {/* ── SIATKA KATEGORII Z FILTRAMI ───────────────────────── */}
      <section
        id="kategorie"
        aria-label="Lista kategorii kursów"
        className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16"
      >
        <CategoryGrid
          categories={categories as CourseCategory[]}
          filters={filters as CategoryFilter[]}
        />
      </section>

      {/* ── CO ZAWIERA KURS + KALKULATOR ─────────────────────── */}
      <section
        aria-label="Szczegóły oferty i finansowanie"
        className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncludedSection
            eyebrow={included.eyebrow}
            title={included.title}
            description={included.description}
            items={included.items}
            pkk={included.pkk}
          />
          <FinancingCalculator
            categories={categories as CourseCategory[]}
            eyebrow={financing.eyebrow}
            badge={financing.badge}
            title={financing.title}
            description={financing.description}
            minInstallments={financing.minInstallments}
            maxInstallments={financing.maxInstallments}
            defaultInstallments={financing.defaultInstallments}
            ticks={financing.ticks}
            defaultCategoryId={financing.defaultCategoryId}
          />
        </div>
      </section>

      {/* ── BANER POMOCY ─────────────────────────────────────── */}
      <section
        className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-4"
        aria-label="Pomoc w wyborze kategorii"
      >
        <HelpBanner
          title={help.title}
          description={help.description}
          callLabel={help.callLabel}
          contactLabel={help.contactLabel}
        />
      </section>
    </>
  );
}