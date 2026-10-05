import type { Metadata } from "next";
import contactData from "@/public/data/contact-data.json";
import { ContactData } from "@/lib/contact";
import ContactForm from "@/components/contact/ContactForm";
import ContactHighlights from "@/components/contact/ContactHighlights";
import ContactIntro from "@/components/contact/ContactIntro";
import ContactLocation from "@/components/contact/ContactLocation";

const data = contactData as ContactData;

export const metadata: Metadata = {
  title: "Kontakt | Szkoła Jazdy Kołobrzeg",
  description:
    "Skontaktuj się ze Szkołą Jazdy w Kołobrzegu. Infolinia +48 573 219 230, biuro przy ul. Koszalińskiej 14 i oświetlony plac manewrowy WORD. Odpowiadamy zwykle w 30 minut.",
  keywords: [
    "kontakt szkoła jazdy Kołobrzeg",
    "plac manewrowy Kołobrzeg",
    "zapisy prawo jazdy Kołobrzeg",
    "infolinia szkoła jazdy",
    "ul. Koszalińska szkoła jazdy",
  ],
  openGraph: {
    title: "Kontakt | Szkoła Jazdy Kołobrzeg",
    description:
      "Bezpłatna konsultacja z instruktorem, infolinia do 20:00 i plac manewrowy przy węźle Koszalińska. Odpowiedź zwykle w 30 minut.",
    locale: "pl_PL",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DrivingSchool",
  name: "Szkoła Jazdy Kołobrzeg",
  url: "https://szkolajazdy-kolobrzeg.pl/contact",
  telephone: "+48573219230",
  email: "ajarek@poczta.onet.pl",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ul. Koszalińska 14",
    postalCode: "78-100",
    addressLocality: "Kołobrzeg",
    addressCountry: "PL",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "14:00",
    },
  ],
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-4 sm:px-6 sm:pt-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section
        aria-label="Dane kontaktowe i formularz"
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10"
      >
        <ContactIntro data={data} />
        <ContactForm form={data.form} />
      </section>

      <ContactLocation location={data.location} />
      <ContactHighlights items={data.highlights} />
    </div>
  );
}
