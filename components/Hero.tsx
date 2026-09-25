import Link from "next/link";
import { ArrowRight, Car, PhoneCall, CheckCircle2, BadgePercent, Clock } from "lucide-react";
import HeroVideoPlayer from "./HeroVideoPlayer";

interface HeroProps {
  videoSrc?: string;
}

export default function Hero({ videoSrc = "/videos/szkola-jazdy.mp4" }: HeroProps) {
  return (
    <section className="relative w-full py-2 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Główna karta Hero z zaokrąglonymi narożnikami i cieniem jak na makiety */}
        <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 lg:p-10 xl:p-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* LEWA KOLUMNA: Informacje, nagłówek, przyciski i gwarancje */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center">
              
              {/* Plakietka / Badge lokalizacji i hasła */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-blue-100/80 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 mb-6">
                <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                <span>KOŁOBRZEG • SZKOŁA JAZDY NOWEJ GENERACJI</span>
              </div>

              {/* Główny nagłówek H1 */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-black tracking-tight text-foreground leading-[1.08] mb-6">
                NAUCZ SIĘ JEŹDZIĆ
                <span className="text-blue-700 dark:text-blue-400 block mt-1">
                  W 3 MIESIĄCE
                </span>
              </h1>

              {/* Opis szkoły jazdy */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-8">
                Już 15 lat zapewniamy najwyższej jakości lekcje jazdy, które kończy z sukcesem ponad 150 kursantów miesięcznie. Bezstresowo, z indywidualnym podejściem i nowoczesną flotą w Kołobrzegu.
              </p>

              {/* Rząd przycisków akcji (CTA) */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
                {/* 1. Główny przycisk: Zapisz się teraz */}
                <Link
                  href="#zapisy"
                  className="group inline-flex items-center justify-center gap-3 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-700/25 hover:shadow-xl hover:shadow-blue-700/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <span>Zapisz się teraz</span>
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>

                {/* 2. Przycisk: Sprawdź kategorie i cennik */}
                <Link
                  href="#kategorie"
                  className="inline-flex items-center gap-3.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100/90 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-blue-100 dark:border-slate-700/80 text-foreground transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Car className="size-5.5 text-blue-700 dark:text-blue-400 shrink-0" />
                  <div className="text-left leading-tight">
                    <div className="text-xs sm:text-sm font-bold text-foreground">
                      Sprawdź
                    </div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                      kategorie i cennik
                    </div>
                  </div>
                </Link>

                {/* 3. Przycisk kontaktu telefonicznego */}
                <a
                  href="tel:+48573219230"
                  className="inline-flex items-center gap-3.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100/90 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-blue-100 dark:border-slate-700/80 text-foreground transition-all duration-200 hover:-translate-y-0.5"
                >
                  <PhoneCall className="size-5 text-blue-700 dark:text-blue-400 shrink-0" />
                  <div className="text-left leading-tight font-bold text-xs sm:text-sm text-foreground tracking-tight">
                    <div>+48 573</div>
                    <div>219 230</div>
                  </div>
                </a>
              </div>

              {/* Pasek gwarancji i atutów na dole lewej kolumny */}
              <div className="pt-2 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs sm:text-sm font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4.5 text-blue-700 dark:text-blue-400 shrink-0" />
                  <span>0% ukrytych kosztów</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgePercent className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Raty 0% bez odsetek</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4.5 text-blue-700 dark:text-blue-400 shrink-0" />
                  <span>Jazdy 7 dni w tygodniu</span>
                </div>
              </div>

            </div>

            {/* PRAWA KOLUMNA: Kreatywne Wideo z odznakami i kontrolkami */}
            <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center">
              <HeroVideoPlayer videoSrc={videoSrc} />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
