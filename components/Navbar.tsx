"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  Car,
  PhoneCall,
  ChevronRight,
} from "lucide-react"
import { useTheme } from "./ThemeProvider"

interface NavLink {
  label: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { label: "Kategorie i Ceny", href: "/categories" },
  { label: "Zapisz się / Wniosek", href: "/application" },
  { label: "Kontakt", href: "/contact" },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { toggleTheme } = useTheme()

  // Blokowanie przewijania strony przy otwartym menu mobilnym
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  // Zamykanie menu klawiszem Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobileMenuOpen])

  return (
    <>
      <header className='sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/40 transition-colors'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4'>
          {/* Lewa strona: Logotyp z przekierowaniem na stronę główną */}
          <Link
            href='/'
            className='flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1'
            aria-label='Szkoła Jazdy - Strona główna'
          >
            {/* Nowoczesny logotyp z symbolem L i autem */}
            <div className='relative flex items-center justify-center size-10 rounded-full bg-linear-to-tr from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200'>
              <Car className='size-5.5' />
              <span className='absolute -top-1 -right-1 flex items-center justify-center size-4.5 rounded bg-blue-900 border border-white text-[10px] font-black tracking-tight text-white leading-none'>
                L
              </span>
            </div>
            <span className='text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors'>
              Szkoła Jazdy
            </span>
          </Link>

          {/* Środek: Menu nawigacji (Desktop) */}
          <nav
            className='hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground'
            aria-label='Nawigacja główna'
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='hover:text-foreground transition-colors relative py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md'
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Prawa strona: Przyciski akcji (Desktop i Mobile) */}
          <div className='flex items-center gap-3'>
            {/* Przełącznik motywu w Navbarze sterowany CSS, odporny na błędy hydratacji */}
            <button
              onClick={toggleTheme}
              type='button'
              aria-label='Przełącz motyw jasny / ciemny'
              className='p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer'
              title='Przełącz motyw'
            >
              <Moon className='size-5 text-slate-700 block dark:hidden' />
              <Sun className='size-5 text-amber-400 hidden dark:block' />
            </button>

            {/* Główny przycisk CTA: Zapisz się na kurs */}
            <Link
              href='/application'
              className='hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600'
            >
              Zapisz się na kurs
            </Link>

            {/* Przycisk profilu / konta kursanta */}
            <Link
              href='#profil'
              aria-label='Profil kursanta'
              className='hidden sm:flex items-center justify-center size-10 rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600'
              title='Panel kursanta'
            >
              <User className='size-5' />
            </Link>

            {/* Przycisk menu mobilnego (Hamburger) */}
            <button
              type='button'
              onClick={() => setIsMobileMenuOpen(true)}
              aria-expanded={isMobileMenuOpen}
              aria-label='Otwórz menu nawigacji'
              className='md:hidden p-2 rounded-lg text-foreground hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            >
              <Menu className='size-6' />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILNE WYSWUWANE MENU Z LEWEJ STRONY EKRANU - Umieszczone poza header dla czystego kontekstu warstw */}
      {/* Tło przyciemniające (Backdrop) */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-90 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden='true'
      />

      {/* Panel wysuwany z lewej strony z nieprzezroczystym tłem */}
      <div
        role='dialog'
        aria-modal='true'
        aria-label='Menu mobilne'
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-100 flex flex-col justify-between p-6 pb-10 transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Nagłówek menu mobilnego z logo i przyciskiem zamknięcia */}
          <div className='flex items-center justify-between pb-6 border-b border-border'>
            <Link
              href='/'
              onClick={() => setIsMobileMenuOpen(false)}
              className='flex items-center gap-3'
            >
              <div className='relative flex items-center justify-center size-9 rounded-full bg-blue-700 text-white shadow-sm'>
                <Car className='size-5' />
                <span className='absolute -top-1 -right-1 flex items-center justify-center size-4 rounded bg-blue-950 border border-white text-[9px] font-black text-white leading-none'>
                  L
                </span>
              </div>
              <span className='text-lg font-bold tracking-tight text-foreground'>
                Szkoła Jazdy
              </span>
            </Link>

            <button
              type='button'
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label='Zamknij menu'
              className='p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            >
              <X className='size-5' />
            </button>
          </div>

          {/* Linki nawigacyjne */}
          <nav className='mt-6 flex flex-col space-y-2'>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className='flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted transition-colors'
              >
                <span>{link.label}</span>
                <ChevronRight className='size-4 text-muted-foreground' />
              </Link>
            ))}
          </nav>
        </div>

        {/* Dolna sekcja menu mobilnego */}
        <div className='pt-6 border-t border-border space-y-4'>
          <Link
            href='/application'
            onClick={() => setIsMobileMenuOpen(false)}
            className='flex items-center justify-center w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-md transition-colors'
          >
            Zapisz się na kurs
          </Link>

          <a
            href='tel:+48573219230'
            className='flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors'
          >
            <PhoneCall className='size-4 text-blue-600 dark:text-blue-400' />
            <span>+48 573 219 230</span>
          </a>

          {/* Przełącznik motywu w panelu mobilnym */}
          <div className='flex items-center justify-between px-2 pt-2 text-sm text-muted-foreground'>
            <span>Tryb motywu</span>
            <button
              type='button'
              onClick={toggleTheme}
              className='flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/60 text-foreground text-xs font-medium cursor-pointer'
            >
              <span className='flex items-center gap-1.5 dark:hidden'>
                <Moon className='size-4 text-slate-700' />
                <span>Ciemny</span>
              </span>
              <span className='items-center gap-1.5 hidden dark:flex'>
                <Sun className='size-4 text-amber-400' />
                <span>Jasny</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
