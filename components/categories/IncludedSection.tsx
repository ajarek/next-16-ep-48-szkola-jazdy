import {
  BriefcaseMedical,
  ClipboardCheck,
  Files,
  Route,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  BriefcaseMedical,
  ClipboardCheck,
  Files,
  Route,
};

interface IncludedItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface IncludedSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  items: IncludedItem[];
  pkk: {
    question: string;
    cta: string;
  };
}

export default function IncludedSection({
  eyebrow,
  title,
  description,
  items,
  pkk,
}: IncludedSectionProps) {
  return (
    <section
      aria-labelledby="included-heading"
      className="rounded-2xl bg-card border border-border shadow-sm p-6 sm:p-8 lg:p-10"
    >
      {/* Eyebrow */}
      <div className="flex items-center gap-2 mb-4">
        <span className="size-5 text-blue-600 dark:text-blue-400">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <p className="text-xs font-bold tracking-widest uppercase text-blue-700 dark:text-blue-400">
          {eyebrow}
        </p>
      </div>

      <h2 id="included-heading" className="text-2xl sm:text-3xl font-black text-foreground mb-3 leading-tight">
        {title}
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-lg leading-relaxed">
        {description}
      </p>

      {/* Siatka elementów */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? Files;
          return (
            <div key={item.id} className="flex items-start gap-3.5">
              <div className="shrink-0 flex items-center justify-center size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50">
                <Icon className="size-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-0.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* PKK CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">{pkk.question}</p>
        <a
          href="#zapisy"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline underline-offset-2 transition-colors"
        >
          {pkk.cta}
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
