import { ShieldCheck, Zap } from "lucide-react";
import { ApplicationData } from "@/lib/application";

interface ApplicationHeaderProps {
  breadcrumbs: ApplicationData["breadcrumbs"];
  header: ApplicationData["header"];
}

export default function ApplicationHeader({
  breadcrumbs,
  header,
}: ApplicationHeaderProps) {
  return (
    <section className="mb-8">
      {/* ── PASEK NAWIGACJI OKRUSZKOWEJ I WSKAŹNIK KROKU ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border/50 text-xs">
        <div className="flex items-center gap-2 font-mono tracking-wider text-muted-foreground uppercase font-semibold text-[11px] sm:text-xs">
          <span className="text-primary font-bold">{breadcrumbs.brand}</span>
          <span>/</span>
          <span>{breadcrumbs.section}</span>
          <span>/</span>
          <span className="text-foreground/80">{breadcrumbs.edition}</span>
        </div>

        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-200 font-medium text-xs shadow-xs">
          <span className="size-2 rounded-full bg-blue-700 dark:bg-blue-400 shrink-0" />
          <span>
            <strong className="font-bold text-blue-950 dark:text-blue-100">Krok 1 z 2:</strong> Dane kursanta i preferencje
          </span>
        </div>
      </div>

      {/* ── TYTUŁ, BADGE ORAZ TRUST BADGES ── */}
      <div className="mt-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl">
          {/* Oficjalny badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-blue-100/90 text-blue-800 dark:bg-blue-950/90 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 mb-4 shadow-xs">
            <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            {header.badge}
          </div>

          {/* Tytuł H1 */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12] mb-3">
            {header.title}
          </h1>

          {/* Opis */}
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {header.subtitle}
          </p>
        </div>

        {/* Pigułki gwarancji po prawej stronie */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-center size-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Gwarancja Ceny</div>
              <div className="text-[11px] text-muted-foreground">Bez ukrytych kosztów paliwa</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-center size-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0">
              <Zap className="size-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Start w 48h</div>
              <div className="text-[11px] text-muted-foreground">Dostęp do e-kursu od ręki</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
