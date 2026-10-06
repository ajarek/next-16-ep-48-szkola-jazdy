import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Logowanie | Panel kursanta — Szkoła Jazdy Kołobrzeg",
  description:
    "Zaloguj się do panelu kursanta Szkoły Jazdy w Kołobrzegu i sprawdź terminy jazd, status zgłoszenia oraz wiadomości od koordynatora.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Logowanie do panelu kursanta | Szkoła Jazdy Kołobrzeg",
    description:
      "Twoje jazdy, zgłoszenie i korespondencja z koordynatorem w jednym miejscu.",
    locale: "pl_PL",
    type: "website",
  },
};

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
