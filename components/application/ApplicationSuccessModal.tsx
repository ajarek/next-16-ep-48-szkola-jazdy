"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { ApplicationCategory } from "@/lib/application";

interface ApplicationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    fullName: string;
    phone: string;
    email: string;
    category: ApplicationCategory;
    timeSlotTitle: string;
    reservationId: string;
  } | null;
}

export default function ApplicationSuccessModal({
  isOpen,
  onClose,
  data,
}: ApplicationSuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-500/20">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-blue-500/10 text-blue-700 dark:text-blue-300 mb-2">
            Rezerwacja #{data.reservationId}
          </div>

          <h2 id="success-modal-title" className="text-2xl font-black text-foreground">
            Wniosek został przyjęty!
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Dziękujemy, <strong className="text-foreground">{data.fullName}</strong>. Twoje miejsce na kursie zostało pomyślnie zarezerwowane.
          </p>
        </div>

        {/* Podsumowanie zgłoszenia */}
        <div className="mt-6 p-4 rounded-2xl bg-muted/50 border border-border/80 space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center py-1 border-b border-border/60">
            <span className="text-muted-foreground">Wybrana kategoria:</span>
            <span className="font-bold text-foreground">{data.category.title}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/60">
            <span className="text-muted-foreground">Koszt szkolenia:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{data.category.priceFormatted}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/60">
            <span className="text-muted-foreground">Preferowana pora jazd:</span>
            <span className="font-semibold text-foreground">{data.timeSlotTitle}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-muted-foreground">Telefon kontaktowy:</span>
            <span className="font-mono text-foreground">{data.phone}</span>
          </div>
        </div>

        {/* Informacja o kontakcie */}
        <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
          <UserCheck className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <strong>Kolejny krok:</strong> Koordynator Zapisów Marta Wiśniewska skontaktuje się z Tobą telefonicznie w ciągu 2 godzin (w godzinach 8:00 – 18:00), aby potwierdzić termin pierwszych zajęć i przekazać dostęp do aplikacji testowej WORD.
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Przypominamy: brak opłat wstępnych • Płatność następuje na 1. zajęciach.</span>
        </div>

        {/* Przyciski nawigacyjne */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
          >
            Zamknij podgląd
          </button>
          <Link
            href="/"
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold text-center transition-opacity flex items-center justify-center gap-2"
          >
            <span>Strona główna</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
