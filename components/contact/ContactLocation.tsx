import { Bus, CheckCircle2, CircleParking, ExternalLink, Repeat } from "lucide-react";
import { ContactLocationContent, LocationBadgeIcon } from "@/lib/contact";
import KolobrzegMap from "./KolobrzegMap";

interface ContactLocationProps {
  location: ContactLocationContent;
}

function BadgeIcon({ icon }: { icon: LocationBadgeIcon }) {
  const className = "size-4 text-blue-600 dark:text-blue-400";
  if (icon === "CircleParking") {
    return <CircleParking className={className} aria-hidden="true" />;
  }
  return <Repeat className={className} aria-hidden="true" />;
}

function LocationCard({ location }: { location: ContactLocationContent }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-slate-800 shadow-xl backdrop-blur-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <h3 className="text-sm font-bold text-slate-900">{location.cardTitle}</h3>
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
          {location.distance}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{location.description}</p>
      <div className="mt-3 flex flex-col gap-2 text-xs font-semibold sm:flex-row sm:items-center sm:gap-4">
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {location.mapsLabel}
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
        <p className="inline-flex items-center gap-1.5 font-medium text-slate-600">
          <Bus className="size-3.5 text-blue-700" aria-hidden="true" />
          {location.busLabel}
        </p>
      </div>
    </div>
  );
}

export default function ContactLocation({ location }: ContactLocationProps) {
  return (
    <section id="lokalizacja" aria-labelledby="lokalizacja-heading" className="scroll-mt-28 mt-16 border-t border-border/70 pt-12">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-blue-700 uppercase dark:text-blue-400">
            {location.eyebrow}
          </p>
          <h2
            id="lokalizacja-heading"
            className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl"
          >
            {location.title}
          </h2>
        </div>
        <ul className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          {location.badges.map((badge) => (
            <li key={badge.id} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeIcon icon={badge.icon} />
              {badge.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative h-72 overflow-hidden rounded-[28px] border border-border/80 shadow-sm sm:h-80 lg:h-[22rem]">
        <KolobrzegMap />
        <div className="absolute inset-x-3 bottom-3 hidden max-w-xl sm:block">
          <LocationCard location={location} />
        </div>
      </div>

      <div className="mt-3 sm:hidden">
        <LocationCard location={location} />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Mapa jest schematem poglądowym okolicy. Dokładną trasę otworzysz w Google Maps.
      </p>
    </section>
  );
}
