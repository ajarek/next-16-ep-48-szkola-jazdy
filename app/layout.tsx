import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FloatingThemeToggle } from "@/components/FloatingThemeToggle";
import WebGlBackground from "@/components/WebGlBackground";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Szkoła Jazdy Kołobrzeg | Naucz się jeździć w 3 miesiące",
  description:
    "Profesjonalna szkoła jazdy nowej generacji w Kołobrzegu. Najwyższa zdawalność WORD 98.4%, nowoczesna flota identyczna z egzaminem, raty 0% bez odsetek i jazdy 7 dni w tygodniu.",
  keywords: [
    "szkoła jazdy Kołobrzeg",
    "prawo jazdy Kołobrzeg",
    "kurs na prawo jazdy kat B",
    "nauka jazdy",
    "zdawalność WORD",
  ],
  authors: [{ name: "Szkoła Jazdy Kołobrzeg" }],
  openGraph: {
    title: "Szkoła Jazdy Kołobrzeg | Naucz się jeździć w 3 miesiące",
    description:
      "Nowoczesna szkoła jazdy w Kołobrzegu. 98.4% zdawalności, flota identyczna z WORD, elastyczne terminy 7 dni w tygodniu.",
    locale: "pl_PL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors selection:bg-blue-600 selection:text-white">
        <ThemeProvider>
          {/* Subtelny shader WebGL ze spotlightem i siatką w tle */}
          <WebGlBackground />

          {/* Główny pasek nawigacyjny widoczny na wszystkich stronach */}
          <Navbar />

          {/* Główna treść strony */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Pływający przycisk zmiany trybu jasny/ciemny w prawym dolnym rogu */}
          <FloatingThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
