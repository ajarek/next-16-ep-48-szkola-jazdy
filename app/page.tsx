import Hero from "@/components/Hero";
import KeyStatsSection from "@/components/KeyStatsSection";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center py-4 sm:py-6 gap-2">
      <Hero videoSrc="/videos/szkola-jazdy.mp4" />
      <KeyStatsSection />
    </div>
  );
}
