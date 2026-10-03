import type { Metadata } from "next";
import applicationData from "@/public/data/application-data.json";
import { ApplicationData } from "@/lib/application";
import ApplicationHeader from "@/components/application/ApplicationHeader";
import ApplicationForm from "@/components/application/ApplicationForm";
import ApplicationGuarantees from "@/components/application/ApplicationGuarantees";

export const metadata: Metadata = {
  title: "Wniosek o szkolenie | Zapisz się na kurs | Szkoła Jazdy Kołobrzeg",
  description:
    "Wypełnij formularz zgłoszeniowy na kurs prawa jazdy kat. B, C, C+E, D w Kołobrzegu. Rezerwacja miejsca w 90 sekund, gwarancja terminu, auta identyczne z WORD oraz elastyczny grafik.",
  keywords: [
    "wniosek o prawo jazdy Kołobrzeg",
    "zapisy na kurs prawa jazdy",
    "formularz zgłoszeniowy prawo jazdy",
    "szkoła jazdy zapisy online",
    "kurs kat B Kołobrzeg",
    "prawo jazdy raty 0%",
  ],
  openGraph: {
    title: "Szczegółowy wniosek o szkolenie | Szkoła Jazdy Kołobrzeg",
    description:
      "Zarezerwuj instruktora prowadzącego, dogodne godziny oraz dedykowany plac manewrowy w Kołobrzegu. Zapisz się w 90 sekund bez opłat wstępnych.",
    locale: "pl_PL",
    type: "website",
  },
};

export default function ApplicationPage() {
  const data = applicationData as ApplicationData;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      {/* ── NAGŁÓWEK STRONY Z OKRUSZKAMI I BADGE'AMI ── */}
      <ApplicationHeader
        breadcrumbs={data.breadcrumbs}
        header={data.header}
      />

      {/* ── GŁÓWNY INTERAKTYWNY FORMULARZ ZGŁOSZENIOWY ── */}
      <ApplicationForm data={data} />

      {/* ── DOLNA SEKCJA GWARANCJI I ZAUFANIA ── */}
      <ApplicationGuarantees guarantees={data.guarantees} />
    </div>
  );
}
