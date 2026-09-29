import Link from "next/link";
import { CheckCircle2, Clock, GraduationCap, Fuel, ArrowRight } from "lucide-react";
import { CourseCategory } from "@/lib/categories";
import { formatPrice } from "@/lib/categories";

interface CategoryCardProps {
  category: CourseCategory;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const badgeClasses =
    category.badgeVariant === "blue"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";

  return (
    <article className="group relative flex flex-col rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 overflow-hidden">
      {/* Ribbon (opcjonalny) */}
      {category.ribbon && (
        <div className="absolute top-3.5 right-0 z-10 bg-emerald-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-l-full shadow-md">
          {category.ribbon}
        </div>
      )}

      {/* Nagłówek karty */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5 mb-1">
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Kategoria{" "}
            <span className="text-blue-700 dark:text-blue-400">{category.code}</span>
          </h2>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClasses}`}
          >
            {category.badge}
          </span>
        </div>
      </div>

      {/* Obraz pojazdu */}
      <div className="relative mx-5 h-36 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.image}
          alt={category.imageAlt}
          className="h-full w-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Cena i raty */}
      <div className="px-5 pt-4 pb-2">
        <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-0.5">
          Cena łączna
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-foreground">
            {formatPrice(category.price)}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">PLN</span>
        </div>

        {/* Pasek "W tym paliwo + raty" */}
        <div className="flex items-center gap-2 mt-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-lg px-2.5 py-1.5">
          <Fuel className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
            W tym paliwo
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground font-medium">
            raty od{" "}
            <strong className="text-foreground">{formatPrice(category.installmentFrom)} zł/mc</strong>
          </span>
        </div>
      </div>

      {/* Czas trwania */}
      <div className="px-5 pt-2 pb-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <GraduationCap className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-medium text-foreground">Teoria</span>
          <span className="ml-auto font-bold text-foreground">{category.theory}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Clock className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-medium text-foreground">Praktyka</span>
          <span className="ml-auto font-bold text-foreground">{category.practice}</span>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-5 border-t border-border" />

      {/* Lista zalet */}
      <ul className="px-5 pt-3 pb-4 flex flex-col gap-2 flex-1">
        {category.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <div className="px-5 pb-5 mt-auto">
        <Link
          href="#zapisy"
          className="group/btn flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-700/20 hover:shadow-lg hover:shadow-blue-700/30 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Zapisz się
          <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </article>
  );
}
