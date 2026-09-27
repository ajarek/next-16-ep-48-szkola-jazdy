"use client";

import { useState } from "react";
import { Star, ShieldCheck, ChevronDown, ChevronUp, Quote, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  category: string;
  result: string;
  date: string;
  comment: string;
  rating: number;
}

interface SocialProofBarProps {
  googleRating?: number;
  totalReviews?: number;
  testimonials?: Testimonial[];
}

export default function SocialProofBar({
  googleRating = 4.9,
  totalReviews = 486,
  testimonials = [
    {
      id: "1",
      name: "Kacper Wiśniewski",
      category: "Kategoria B",
      result: "Zdane za 1. razem!",
      date: "2 dni temu",
      comment: "Super podejście i zero stresu na jazdach. Pan Tomasz nauczył mnie manewrów w Kołobrzegu tak, że egzamin w Koszalinie był czystą formalnością.",
      rating: 5,
    },
    {
      id: "2",
      name: "Magdalena Kowalczyk",
      category: "Kategoria B (Automat)",
      result: "Zdane za 1. razem!",
      date: "W zeszłym tygodniu",
      comment: "Bałam się wsiąść za kółko po latach, a dzięki cierpliwości instruktora poczułam się w 100% pewnie na drodze. Polecam każdemu!",
      rating: 5,
    },
    {
      id: "3",
      name: "Michał Szymański",
      category: "Kategoria C+E",
      result: "Zdane za 1. razem!",
      date: "2 tygodnie temu",
      comment: "Konkretnie, na temat i profesjonalnie. Nowe auta, idealny plac manewrowy. Kwalifikacja zawodowa i prawo jazdy bez żadnych przeszkód.",
      rating: 5,
    },
  ],
}: SocialProofBarProps) {
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="w-full mt-6">
      {/* Główny pasek social proof z certyfikatami i ocenami */}
      <div className="relative rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Lewa strona: Awatary kursantów + ocena Google */}
        <div className="flex flex-wrap items-center gap-4 text-center sm:text-left">
          {/* Stos awatarów kursantów */}
          <div className="flex -space-x-2.5 overflow-hidden p-0.5">
            <span className="inline-flex size-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-linear-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs items-center justify-center shadow-sm">
              AK
            </span>
            <span className="inline-flex size-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-linear-to-tr from-sky-500 to-teal-500 text-white font-bold text-xs items-center justify-center shadow-sm">
              MK
            </span>
            <span className="inline-flex size-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-linear-to-tr from-amber-500 to-orange-500 text-white font-bold text-xs items-center justify-center shadow-sm">
              PW
            </span>
            <span className="inline-flex size-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-800 dark:bg-slate-700 text-white font-extrabold text-[10px] items-center justify-center shadow-sm">
              +12k
            </span>
          </div>

          {/* Ocena z gwiazdkami i źródłem */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-foreground">
                {googleRating.toFixed(1)}
              </span>
              <div className="flex items-center text-amber-500" aria-label={`Ocena ${googleRating} na 5 gwiazdek`}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-muted-foreground ml-1">
                ({totalReviews} recenzji)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Zweryfikowane opinie absolwentów w Google & Facebook</span>
            </div>
          </div>
        </div>

        {/* Prawa strona: Gwarancja urzędowa + przycisk do rozwinięcia opinii */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <ShieldCheck className="size-4 text-teal-600 dark:text-teal-400" />
            <span>Akredytowany Ośrodek Szkolenia Kierowców</span>
          </div>

          <button
            type="button"
            onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold text-xs border border-blue-200/60 dark:border-blue-800/60 transition-colors"
            aria-expanded={isReviewsExpanded}
          >
            <Sparkles className="size-3.5" />
            <span>{isReviewsExpanded ? "Zwiń opinie kursantów" : "Zobacz opinie kursantów"}</span>
            {isReviewsExpanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Rozwijany panel z rzeczywistymi opiniami i historiami sukcesu */}
      {isReviewsExpanded && (
        <div className="mt-3 p-5 sm:p-6 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Quote className="size-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-foreground">
                Historie sukcesu naszych kursantów w Kołobrzegu
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTestimonial(index)}
                  className={cn(
                    "size-2 rounded-full transition-all",
                    activeTestimonial === index
                      ? "w-6 bg-blue-600 dark:bg-blue-400"
                      : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                  )}
                  aria-label={`Przejdź do opinii ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => setActiveTestimonial(idx)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all cursor-pointer",
                  activeTestimonial === idx
                    ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-sm"
                    : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-foreground">
                    {t.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                    <CheckCircle2 className="size-3" />
                    {t.result}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                  „{t.comment}”
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-2 border-t border-border/40">
                  <span>{t.category}</span>
                  <span>{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
