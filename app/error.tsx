"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import WebGlBackground from "@/components/WebGlBackground"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Komponent graniczny błędu (Error Boundary) dla całej aplikacji.
 * Umożliwia użytkownikowi ponowną próbę wyrenderowania strony (reset)
 * lub bezpieczny powrót na stronę główną bez utraty kontekstu.
 */
export default function GlobalErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Rejestracja błędu w celach diagnostycznych
    console.error("Wystąpił nieoczekiwany błąd w aplikacji:", error)
  }, [error])

  return (
    <main className='relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden selection:bg-primary/30 selection:text-primary'>
      {/* Tło WebGL z gradientem i siatką */}

      <WebGlBackground />
      {/* Delikatne poświaty tła */}
      <div className='absolute -top-32 -left-32 w-80 h-80 rounded-full bg-secondary/15 blur-[120px] pointer-events-none -z-10' />
      <div className='absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-tertiary/15 blur-[140px] pointer-events-none -z-10' />

      {/* Główna karta błędu - na wierzchu ponad siatką w tle */}
      <div className='w-full max-w-xl relative z-10 bg-card rounded-3xl p-8 sm:p-12 text-center shadow-2xl border border-border overflow-hidden'>
        {/* Odznaka błędu */}
        <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-destructive/15 border border-destructive/30 backdrop-blur-xl shadow-sm mb-6'>
          <AlertTriangle className='w-4 h-4 text-destructive' />
          <span className='text-xs font-bold uppercase tracking-wider text-destructive'>
            Błąd aplikacji
          </span>
        </div>

        {/* Ikona ostrzeżenia */}
        <div className='relative flex items-center justify-center my-4'>
          <div className='w-20 h-20 rounded-3xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive shadow-[0_0_35px_rgba(244,63,94,0.25)]'>
            <AlertTriangle className='w-10 h-10' />
          </div>
        </div>

        {/* Nagłówek błędu */}
        <h1 className='text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-4'>
          Coś poszło nie tak
        </h1>

        {/* Opis dla użytkownika w języku polskim */}
        <p className='text-sm sm:text-base text-muted-foreground max-w-md mx-auto mt-3 leading-relaxed'>
          Wystąpił nieoczekiwany problem podczas przetwarzania operacji. Twoje
          dane w Firebase są bezpieczne.
        </p>

        {error.digest && (
          <p className='text-xs font-mono text-muted-foreground mt-2 bg-muted py-1 px-3 rounded-md inline-block'>
            Kod błędu: {error.digest}
          </p>
        )}

        {/* Akcje użytkownika */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 w-full'>
          <button
            type='button'
            onClick={() => reset()}
            className='w-full sm:w-auto px-6 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-[0_0_24px_var(--glow-primary)] hover:shadow-[0_0_36px_var(--glow-primary)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer'
          >
            <RefreshCw className='w-4 h-4' />
            <span>Spróbuj ponownie</span>
          </button>

          <Link
            href='/'
            className='w-full sm:w-auto px-6 py-3.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold text-sm border border-border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer'
          >
            <Home className='w-4 h-4' />
            <span>Wróć na stronę główną</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
