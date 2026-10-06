import type { Metadata } from "next";
import AccountPanel from "@/components/account/AccountPanel";

export const metadata: Metadata = {
  title: "Moje konto | Panel kursanta — Szkoła Jazdy Kołobrzeg",
  description:
    "Panel kursanta Szkoły Jazdy w Kołobrzegu: zgłoszenia, harmonogram jazd, postęp szkolenia i wiadomości od koordynatora.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Panel kursanta | Szkoła Jazdy Kołobrzeg",
    description:
      "Zgłoszenia, terminy jazd i postęp szkolenia w jednym miejscu.",
    locale: "pl_PL",
    type: "website",
  },
};

export default function AccountPage() {
  return <AccountPanel />;
}
