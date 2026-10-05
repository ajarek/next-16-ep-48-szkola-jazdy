import Link from "next/link"
import {
  Car,
  MapPin,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Share2,
  Users2,
  MessageCircle,
  Code2,
} from "lucide-react"

const QUICK_LINKS = [
  { label: "Kategorie A, B, C, CE, D", href: "/categories" },
  { label: "Formularz PKK & Zapisy", href: "/#zapisy" },
  { label: "Dojazd i Sala Wykładowa", href: "/contact" },
]

const LEGAL_LINKS = [
  { label: "Polityka Prywatności", href: "#polityka" },
  { label: "Regulamin Kursów", href: "#regulamin" },
  { label: "Licencja WORD", href: "#licencja" },
]

const SOCIAL_ICONS = [Share2, Users2, MessageCircle, Code2]

// Rok w prawach autorskich liczony dynamicznie (serwer) — bez hardcoded daty
const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className='mt-20 border-t border-border bg-white/85 dark:bg-slate-900/90 backdrop-blur-md'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Siatka 4 kolumn */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10'>
          {/* Kol 1: Brand */}
          <div>
            <div className='flex items-center gap-2.5 mb-4'>
              <div className='relative flex items-center justify-center size-9 rounded-full bg-blue-700 text-white shadow-sm'>
                <Car className='size-5' aria-hidden='true' />
                <span className='absolute -top-1 -right-1 flex items-center justify-center size-4 rounded bg-blue-950 border border-white text-[9px] font-black text-white leading-none'>
                  L
                </span>
              </div>
              <span className='text-base font-black tracking-tight text-foreground'>
                Szkoła Jazdy
              </span>
            </div>
            <p className='text-sm text-foreground/70 dark:text-foreground/65 leading-relaxed mb-4'>
              Nowoczesna szkoła nauki jazdy w Kołobrzegu. Technologiczna
              precyzja, pojazdy zgodne ze standardem WORD i bezstresowa edukacja
              na najwyższym poziomie.
            </p>
            <div className='inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400'>
              <CheckCircle2 className='size-4' aria-hidden='true' />
              Akredytowany Ośrodek Szkolenia
            </div>
          </div>

          {/* Kol 2: Szybkie linki */}
          <div>
            <h2 className='text-xs font-black tracking-widest uppercase text-foreground mb-4'>
              Szybkie linki
            </h2>
            <nav aria-label='Szybkie linki w stopce'>
              <ul className='space-y-2.5'>
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className='text-sm text-foreground/70 dark:text-foreground/65 hover:text-foreground transition-colors focus:outline-none focus-visible:underline'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Kol 3: Kontakt */}
          <div>
            <h2 className='text-xs font-black tracking-widest uppercase text-foreground mb-4'>
              Kontakt &amp; Lokalizacja
            </h2>
            <ul className='space-y-2.5 text-sm text-foreground/70 dark:text-foreground/65'>
              <li className='flex items-start gap-2.5'>
                <MapPin
                  className='size-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0'
                  aria-hidden='true'
                />
                <span>ul. Koszalińska 12, 78-100 Kołobrzeg</span>
              </li>
              <li className='flex items-center gap-2.5'>
                <Mail
                  className='size-4 text-blue-600 dark:text-blue-400 shrink-0'
                  aria-hidden='true'
                />
                <a
                  href='mailto:ajarek@poczta.onet.pl'
                  className='hover:text-foreground underline-offset-2 hover:underline transition-colors'
                >
                  ajarek@poczta.onet.pl
                </a>
              </li>
              <li className='flex items-center gap-2.5'>
                <Phone
                  className='size-4 text-blue-600 dark:text-blue-400 shrink-0'
                  aria-hidden='true'
                />
                <a
                  href='tel:+48573219230'
                  className='hover:text-foreground underline-offset-2 hover:underline transition-colors'
                >
                  +48 573 219 230
                </a>
              </li>
              <li className='flex items-center gap-2.5'>
                <Clock
                  className='size-4 text-blue-600 dark:text-blue-400 shrink-0'
                  aria-hidden='true'
                />
                <span>Pn - Pt: 08:00 - 18:00</span>
              </li>
            </ul>
          </div>

          {/* Kol 4: Gwarancja */}
          <div>
            <h2 className='text-xs font-black tracking-widest uppercase text-foreground mb-4'>
              Standard &amp; Zaufanie
            </h2>
            <div className='flex items-start gap-2.5 mb-5'>
              <CheckCircle2
                className='size-5 text-emerald-500 shrink-0 mt-0.5'
                aria-hidden='true'
              />
              <div>
                <p className='text-sm font-bold text-foreground mb-0.5'>
                  Gwarancja Zdawalności
                </p>
                <p className='text-xs text-foreground/70 dark:text-foreground/65 leading-relaxed'>
                  Szkolenia na trasach egzaminacyjnych WORD z wykorzystaniem
                  autentycznych pojazdów egzaminacyjnych.
                </p>
              </div>
            </div>

            {/* Ikony społecznościowe (dekoracyjne) */}
            <div className='flex items-center gap-3'>
              {SOCIAL_ICONS.map((Icon, i) => (
                <button
                  key={i}
                  type='button'
                  aria-label='Medium społecznościowe – funkcja w przygotowaniu'
                  className='flex items-center justify-center size-8 rounded-lg border border-slate-300 dark:border-slate-700 text-foreground/60 hover:text-foreground hover:border-blue-400 dark:hover:border-blue-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                >
                  <Icon className='size-3.5' aria-hidden='true' />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dolna belka */}
        <div className='border-t border-slate-300 dark:border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/60 dark:text-foreground/55'>
          <p>
            © {CURRENT_YEAR} Szkoła Jazdy Kołobrzeg. Wszelkie prawa zastrzeżone.
          </p>
          <nav aria-label='Linki prawne'>
            <ul className='flex flex-wrap items-center gap-4'>
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='hover:text-foreground underline-offset-2 hover:underline transition-colors focus:outline-none focus-visible:underline'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
