import { z } from "zod"

export type ChannelIcon = "Phone" | "Mail" | "MapPin" | "Clock"
export type KickerTone = "info" | "mail" | "muted"
export type HighlightIcon = "Car" | "CreditCard" | "Headset"
export type LocationBadgeIcon = "Repeat" | "CircleParking"
export type SocialId = "x" | "instagram" | "youtube" | "facebook"

export interface ContactChannel {
  id: string
  icon: ChannelIcon
  kicker: string
  kickerTone: KickerTone
  primary: string
  primaryHref?: string
  secondary?: string
  secondaryHref?: string
  note?: string
}

export interface contactopic {
  id: string
  label: string
  hint: string
}

export interface ContactFormContent {
  title: string
  badge: string
  description: string
  submitLabel: string
  consentLead: string
  consentLinkLabel: string
  placeholders: {
    name: string
    email: string
    message: string
  }
  topics: contactopic[]
}

export interface ContactLocationContent {
  eyebrow: string
  title: string
  badges: { id: string; icon: LocationBadgeIcon; text: string }[]
  cardTitle: string
  distance: string
  description: string
  mapsLabel: string
  mapsUrl: string
  busLabel: string
}

export interface ContactHighlight {
  id: string
  icon: HighlightIcon
  title: string
  description: string
}

export interface ContactData {
  badge: string
  eyebrow: string
  title: string
  lead: string
  leadHighlight: string
  reaction: {
    time: string
    title: string
    note: string
  }
  socialLabel: string
  channels: ContactChannel[]
  socials: { id: SocialId; label: string }[]
  form: ContactFormContent
  location: ContactLocationContent
  highlights: ContactHighlight[]
}

export interface ServiceStatus {
  phoneOpen: boolean
  officeOpen: boolean
  lectureOpen: boolean
  timeLabel: string
  headline: string
  detail: string
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

function warsawParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun"
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0")
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  )

  return {
    day: WEEKDAY_INDEX[weekday] ?? 0,
    minutes: hour * 60 + minute,
    timeLabel: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  }
}

function inRange(minutes: number, start: number, end: number) {
  return minutes >= start && minutes < end
}

/** Godziny biura i infolinii liczone w strefie szkoły (Europa/Warszawa). */
export function getOfficeStatus(date = new Date()): ServiceStatus {
  const { day, minutes, timeLabel } = warsawParts(date)
  const phoneOpen = day >= 1 && day <= 6 && inRange(minutes, 8 * 60, 20 * 60)
  const officeOpen = day >= 1 && day <= 5 && inRange(minutes, 9 * 60, 18 * 60)
  const lectureOpen = day === 6 && inRange(minutes, 10 * 60, 14 * 60)

  if (officeOpen) {
    return {
      phoneOpen,
      officeOpen,
      lectureOpen,
      timeLabel,
      headline: "Biuro otwarte",
      detail: "Koordynator odbierze telefon od razu",
    }
  }

  if (lectureOpen) {
    return {
      phoneOpen,
      officeOpen,
      lectureOpen,
      timeLabel,
      headline: "Trwają wykłady PKK",
      detail: "Sala wykładowa czynna do 14:00",
    }
  }

  if (phoneOpen) {
    return {
      phoneOpen,
      officeOpen,
      lectureOpen,
      timeLabel,
      headline: "Infolinia czynna",
      detail: "Biuro stacjonarne jest już zamknięte",
    }
  }

  return {
    phoneOpen,
    officeOpen,
    lectureOpen,
    timeLabel,
    headline: "Teraz nieczynne",
    detail: "Odpowiadamy w ciągu 30 minut w godzinach pracy",
  }
}

export function createContactSchema(topicIds: readonly string[]) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(3, "Imię i nazwisko musi zawierać minimum 3 znaki")
      .regex(
        /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/,
        "Dozwolone są tylko litery, spacje i myślniki",
      ),
    email: z
      .string()
      .trim()
      .min(1, "Wprowadź adres e-mail")
      .email("Niepoprawny format adresu e-mail"),
    topicId: z
      .string()
      .refine((value) => topicIds.includes(value), "Wybierz temat wiadomości"),
    message: z
      .string()
      .trim()
      .min(10, "Wiadomość powinna mieć co najmniej 10 znaków")
      .max(1000, "Wiadomość może mieć najwyżej 1000 znaków"),
    consent: z.boolean().refine((value) => value, {
      message: "Zgoda jest wymagana, abyśmy mogli odpisać",
    }),
  })
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>
