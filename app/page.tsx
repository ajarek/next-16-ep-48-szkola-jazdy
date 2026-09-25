import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center py-4 sm:py-6">
      <Hero videoSrc="/videos/szkola-jazdy.mp4" />
    </div>
  );
}
