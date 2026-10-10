import type { Metadata } from "next";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export const metadata: Metadata = {
  title: "Panel administracyjny | Szkoła Jazdy Kołobrzeg",
  description:
    "Panel administracyjny Szkoły Jazdy w Kołobrzegu: kursy, kursanci, zapisy, płatności i zgłoszenia w jednym widoku.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Panel administracyjny | Szkoła Jazdy Kołobrzeg",
    description:
      "Kursy, kursanci i płatności — zagregowany widok dla administracji szkoły jazdy.",
    locale: "pl_PL",
    type: "website",
  },
};

export default function DashboardPage() {
  return <AdminDashboard />;
}
