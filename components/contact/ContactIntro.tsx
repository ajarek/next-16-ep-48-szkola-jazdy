import { Clock, Mail, MapPin, Phone } from "lucide-react";
import {
  ChannelIcon,
  ContactChannel,
  ContactData,
  KickerTone,
  SocialId,
} from "@/lib/contact";
import LiveAvailability from "./LiveAvailability";

interface ContactIntroProps {
  data: ContactData;
}

const KICKER_CLASS: Record<KickerTone, string> = {
  info: "text-blue-600 dark:text-blue-400",
  mail: "text-emerald-600 dark:text-emerald-400",
  muted: "text-muted-foreground",
};

function ChannelGlyph({ icon }: { icon: ChannelIcon }) {
  const className = "size-5";
  switch (icon) {
    case "Phone":
      return <Phone className={`${className} text-blue-600 dark:text-blue-400`} aria-hidden="true" />;
    case "Mail":
      return <Mail className={`${className} text-emerald-600 dark:text-emerald-400`} aria-hidden="true" />;
    case "MapPin":
      return <MapPin className={`${className} text-blue-600 dark:text-blue-400`} aria-hidden="true" />;
    case "Clock":
      return <Clock className={`${className} text-blue-600 dark:text-blue-400`} aria-hidden="true" />;
  }
}

function SocialGlyph({ id }: { id: SocialId }) {
  const common = "size-3.5";
  switch (id) {
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.7 10.3 22.2 2h-2.2l-6.5 7.4L8.2 2H2l7.8 11.2L2.2 22H4.4l7-8 5.6 8H22l-7.3-11.7Zm-2.5 2.8-.8-1.2L4.9 3.5h2.5l5 7.1.8 1.2 6.7 9.6h-2.5l-5.2-7.3Z"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm9.2 1.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
          />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M22 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C18.2 5.4 12 5.4 12 5.4s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 9 2 12.2 2 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6ZM10 15.5v-6.6l5.2 3.3-5.2 3.3Z"
          />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path
            fill="currentColor"
            d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1Z"
          />
        </svg>
      );
  }
}

function ChannelCard({ channel }: { channel: ContactChannel }) {
  return (
    <article className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted/70">
          <ChannelGlyph icon={channel.icon} />
        </span>
        <span className={`text-[11px] font-semibold ${KICKER_CLASS[channel.kickerTone]}`}>
          {channel.kicker}
        </span>
      </div>

      {channel.primaryHref ? (
        <a
          href={channel.primaryHref}
          className="block text-sm font-bold leading-snug text-foreground underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm break-words"
          {...(channel.primaryHref.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {channel.primary}
        </a>
      ) : (
        <p className="text-sm font-bold leading-snug text-foreground">{channel.primary}</p>
      )}

      {channel.secondary && channel.secondaryHref ? (
        <a
          href={channel.secondaryHref}
          className="mt-1 block text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm break-all"
        >
          {channel.secondary}
        </a>
      ) : null}

      {channel.note ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{channel.note}</p>
      ) : null}

      {channel.id === "phone" ? (
        <div className="mt-2">
          <LiveAvailability variant="phone" />
        </div>
      ) : null}

      {channel.id === "hours" ? <LiveAvailability variant="office" /> : null}
    </article>
  );
}

export default function ContactIntro({ data }: ContactIntroProps) {
  return (
    <div>
      <p className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/70 dark:text-blue-200">
        {data.badge}
      </p>

      <p className="mt-6 text-xs font-bold tracking-[0.18em] text-blue-700 uppercase dark:text-blue-400">
        {data.eyebrow}
      </p>

      <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
        {data.title}
      </h1>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {data.lead}{" "}
        <strong className="font-semibold text-foreground">{data.leadHighlight}</strong>.
      </p>

      <a
        href="#formularz"
        className="mt-4 inline-flex items-center rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:hidden"
      >
        Napisz wiadomość
      </a>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-4 py-3 shadow-sm">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
          <Clock className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {data.reaction.title}:{" "}
            <span className="font-black">{data.reaction.time}</span>
          </p>
          <p className="text-xs text-muted-foreground">{data.reaction.note}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data.channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">{data.socialLabel}</p>
        <ul className="flex items-center gap-2">
          {data.socials.map((social) => (
            <li key={social.id}>
              <button
                type="button"
                aria-label={`${social.label} — profil w przygotowaniu`}
                title="Profil w przygotowaniu"
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-blue-400 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <SocialGlyph id={social.id} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
