import Link from "next/link";
import { HelpCircle, PhoneCall, MessageSquare } from "lucide-react";

interface HelpBannerProps {
  title: string;
  description: string;
  callLabel: string;
  contactLabel: string;
}

export default function HelpBanner({
  title,
  description,
  callLabel,
  contactLabel,
}: HelpBannerProps) {
  return (
    <section
      aria-label="Pomoc w wyborze kategorii"
      className="relative rounded-2xl bg-blue-700 dark:bg-blue-900 overflow-hidden"
    >
      {/* Subtelna dekoracja tła */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-6 sm:px-10 py-8">
        {/* Lewa strona */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 flex items-center justify-center size-12 rounded-2xl bg-white/15 border border-white/20">
            <HelpCircle className="size-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white mb-1">{title}</h2>
            <p className="text-sm text-blue-100 dark:text-blue-200 max-w-md leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Prawa strona: przyciski */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
          <a
            href="tel:+48573219230"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <PhoneCall className="size-4 shrink-0" aria-hidden="true" />
            {callLabel}
          </a>

          <Link
            href="#kontakt"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-800 text-sm font-bold hover:bg-blue-50 transition-all duration-200 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
            {contactLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
