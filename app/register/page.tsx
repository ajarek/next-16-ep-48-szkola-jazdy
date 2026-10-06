import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Rejestracja | Konto kursanta — Szkoła Jazdy Kołobrzeg",
  description:
    "Załóż darmowe konto kursanta Szkoły Jazdy w Kołobrzegu. Zapisy na kurs, terminy jazd i kontakt z koordynatorem w jednym miejscu.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Rejestracja konta kursanta | Szkoła Jazdy Kołobrzeg",
    description:
      "Konto kursanta w 30 sekund: zapisy, harmonogram jazd i wiadomości od koordynatora.",
    locale: "pl_PL",
    type: "website",
  },
};

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <AuthForm mode="register" />
    </AuthShell>
  );
}
