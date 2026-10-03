"use client";

import { useEffect } from "react";
import { X, HelpCircle, Stethoscope, Camera, Landmark, CheckCircle2 } from "lucide-react";

interface PkkInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PkkInfoModal({ isOpen, onClose }: PkkInfoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pkk-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Tło przyciemniające */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Kontener okna */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Nagłówek */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <HelpCircle className="size-5" />
            </div>
            <div>
              <h2 id="pkk-modal-title" className="text-xl font-bold text-foreground">
                Czym jest i jak uzyskać numer PKK?
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Profil Kandydata na Kierowcę (20-cyfrowy unikalny identyfikator)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno informacyjne"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Treść krok po kroku */}
        <div className="mt-6 space-y-4 text-sm text-foreground">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-center gap-3">
            <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Dobra wiadomość:</strong> Możesz złożyć wniosek i zapisać się na kurs bez PKK. Numer możesz dostarczyć w trakcie trwania części teoretycznej.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-muted/50 border border-border/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase mb-2">
                  <Stethoscope className="size-4" /> Krok 1
                </div>
                <h3 className="font-semibold text-sm mb-1">Badanie lekarskie</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Orzeczenie lekarskie o braku przeciwwskazań (możesz wykonać u lekarza współpracującego w naszej siedzibie).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/50 border border-border/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase mb-2">
                  <Camera className="size-4" /> Krok 2
                </div>
                <h3 className="font-semibold text-sm mb-1">Zdjęcie biometryczne</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Jedno aktualne, kolorowe zdjęcie biometryczne (jak do dowodu osobistego / paszportu, format 35x45 mm).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/50 border border-border/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase mb-2">
                  <Landmark className="size-4" /> Krok 3
                </div>
                <h3 className="font-semibold text-sm mb-1">Wydział Komunikacji</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Złóż wniosek w Starostwie Powiatowym w Kołobrzegu lub online przez profil ePUAP na gov.pl.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border mt-3 text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Gdzie w Kołobrzegu?</span> Starostwo Powiatowe w Kołobrzegu – Wydział Komunikacji, ul. Gryfitów 4-6. Numer PKK wydawany jest bezpłatnie, zazwyczaj od ręki.
          </div>
        </div>

        {/* Dolny przycisk */}
        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Rozumiem, wracam do wniosku
          </button>
        </div>
      </div>
    </div>
  );
}
