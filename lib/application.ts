import { z } from "zod";

export interface ApplicationCategory {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  price: number;
  priceFormatted: string;
  hoursSummary: string;
  icon: "Car" | "Truck" | "Trailer" | "Bus";
}

export interface TimePreference {
  id: string;
  title: string;
  hours: string;
  icon: "Sunrise" | "Sun" | "Moon";
}

export interface GuaranteeItem {
  id: string;
  icon: "CreditCard" | "Compass" | "ShieldCheck";
  title: string;
  subtitle: string;
}

export interface ApplicationData {
  breadcrumbs: {
    brand: string;
    section: string;
    edition: string;
    step: string;
  };
  header: {
    badge: string;
    title: string;
    subtitle: string;
    trustBadges: {
      id: string;
      title: string;
      subtitle: string;
      icon: "ShieldCheck" | "Zap";
    }[];
  };
  categories: ApplicationCategory[];
  timePreferences: TimePreference[];
  learningAccess: {
    title: string;
    subtitle: string;
    badge: string;
  };
  summary: {
    availabilityBadge: string;
    spotsLeft: string;
    costLabel: string;
    features: string[];
    ctaText: string;
    note: string;
  };
  coordinator: {
    name: string;
    role: string;
    status: string;
    image: string;
    quote: string;
    phone: string;
    hours: string;
  };
  fleet: {
    badge: string;
    title: string;
    subtitle: string;
    image: string;
  };
  guarantees: GuaranteeItem[];
}

export const applicationSchema = z.object({
  fullName: z
    .string()
    .min(3, "Imię i nazwisko musi zawierać minimum 3 znaki")
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/, "Dozwolone są tylko litery i myślniki"),
  age: z
    .string()
    .min(1, "Podaj swój wiek")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 17 && num <= 99;
    }, "Minimalny wiek rozpoczęcia kursu to ukończone 17 lat i 9 miesięcy"),
  phone: z
    .string()
    .min(9, "Numer telefonu musi zawierać minimum 9 cyfr")
    .regex(/^[0-9\s-+()]{9,15}$/, "Wprowadź prawidłowy numer telefonu"),
  email: z
    .string()
    .min(1, "Wprowadź adres e-mail")
    .email("Niepoprawny format adresu e-mail"),
  pkkNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.replace(/\s/g, "").length === 20,
      "Numer PKK składa się dokładnie z 20 cyfr (możesz uzupełnić później)"
    ),
  categoryId: z.string().min(1, "Wybierz kategorię prawa jazdy"),
  timeSlot: z.string().min(1, "Wybierz preferowaną porę dnia na jazdy"),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
