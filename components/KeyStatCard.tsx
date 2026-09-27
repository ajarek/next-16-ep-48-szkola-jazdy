"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatItem {
  id: string;
  icon: "Calendar" | "Users" | "TrendingUp" | "BadgeCheck";
  badge: string;
  badgeVariant?: "blue" | "cyan" | "indigo" | "teal";
  value: string;
  numericValue: number;
  suffix?: string;
  title: string;
  description: string;
  accentColor?: string;
  highlight?: string;
  ariaLabel?: string;
}

interface KeyStatCardProps {
  stat: StatItem;
  index: number;
}

export default function KeyStatCard({ stat, index }: KeyStatCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [displayValue, setDisplayValue] = useState<string>(stat.value);
  const hasAnimatedRef = useRef(false);

  // Płynna animacja licznika przy wejściu w obszar widoku (z obsługą prefers-reduced-motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || hasAnimatedRef.current) {
      return;
    }

    const currentCard = cardRef.current;
    if (!currentCard) return;

    let animationFrameId: number;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;

          const duration = 1600; // ms
          const startTimestamp = performance.now();
          const target = stat.numericValue;
          const isDecimal = target % 1 !== 0;

          const step = (currentTime: number) => {
            const elapsed = currentTime - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            // Wykładnicze wyhamowanie animacji (easeOutExpo)
            const easeOutExpo =
              progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentNumber = easeOutExpo * target;

            if (isDecimal) {
              const formatted = currentNumber.toFixed(1).replace(".", ",");
              setDisplayValue(`${formatted}${stat.suffix || ""}`);
            } else if (target >= 1000) {
              const rounded = Math.round(currentNumber);
              const formatted = rounded.toLocaleString("pl-PL");
              setDisplayValue(`${formatted}${stat.suffix || ""}`);
            } else {
              const rounded = Math.round(currentNumber);
              setDisplayValue(`${rounded}${stat.suffix || ""}`);
            }

            if (progress < 1) {
              animationFrameId = requestAnimationFrame(step);
            } else {
              setDisplayValue(stat.value);
            }
          };

          animationFrameId = requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(currentCard);

    return () => {
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [stat.numericValue, stat.suffix, stat.value]);

  // Stylizacja odznak pill w prawym górnym rogu karty
  const badgeStyles = {
    blue: "bg-blue-100/80 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300",
    cyan: "bg-sky-100/80 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300",
    indigo: "bg-indigo-100/80 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300",
    teal: "bg-teal-100/80 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300",
  }[stat.badgeVariant || "blue"];

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex flex-col justify-between",
        "rounded-[1.75rem] p-6 sm:p-7 lg:p-8",
        "bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl",
        "border border-slate-200/80 dark:border-slate-800",
        "shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50",
        "hover:shadow-2xl hover:shadow-blue-600/10 dark:hover:shadow-blue-500/10",
        "hover:-translate-y-1.5 transition-all duration-300 ease-out",
        "overflow-hidden"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
      role="region"
      aria-label={stat.ariaLabel || `${stat.title}: ${stat.value}`}
    >
      {/* Subtelny pasek świetlny na górnej krawędzi karty (gradient) */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Górny wiersz: Czysta ikona po lewej i odznaka pigułkowa po prawej */}
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-7">
        <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          {stat.icon === "Calendar" && (
            <Calendar className="size-7 text-blue-700 dark:text-blue-400 stroke-[2.2]" />
          )}
          {stat.icon === "Users" && (
            <Users className="size-7 text-sky-700 dark:text-sky-400 stroke-[2.2]" />
          )}
          {stat.icon === "TrendingUp" && (
            <TrendingUp className="size-7 text-blue-700 dark:text-blue-400 stroke-[2.2]" />
          )}
          {stat.icon === "BadgeCheck" && (
            <div className="relative flex items-center justify-center">
              {/* Ikona rozety z checkmarkiem wypełniona ciemnym turkusem / teal jak na wzorcu */}
              <svg
                viewBox="0 0 24 24"
                className="size-7.5 text-teal-700 dark:text-teal-400"
                fill="currentColor"
              >
                <path d="M12 2l2.4 2.1 3.2-.4 1.4 2.9 3.1 1.1-.3 3.2 2.1 2.4-1.6 2.8.9 3.1-3 1.2-.8 3.1-3.2.1-1.9 2.6-2.8-1.5-2.7 1.7-1.9-2.6-3.2-.1-.8-3.1-3-1.2.9-3.1-1.6-2.8 2.1-2.4-.3-3.2 3.1-1.1 1.4-2.9 3.2.4L12 2z" />
                <path
                  d="M9 12l2 2 4-4"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Etykieta / Badge w prawym górnym rogu */}
        <span
          className={cn(
            "inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold tracking-tight select-none transition-colors",
            badgeStyles
          )}
        >
          {stat.badge}
        </span>
      </div>

      {/* Część centralna: Duża wartość statystyki */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight text-slate-900 dark:text-white leading-none font-sans">
            {displayValue}
          </span>
        </div>

        {/* Tytuł statystyki */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-3 mb-2 leading-snug">
          {stat.title}
        </h3>

        {/* Opis pod statystyką */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
          {stat.description}
        </p>
      </div>
    </div>
  );
}
