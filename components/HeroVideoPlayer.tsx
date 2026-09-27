"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Star, CarFront } from "lucide-react";

interface HeroVideoPlayerProps {
  videoSrc: string;
}

/**
 * Kreatywny odtwarzacz wideo z interaktywnymi kontrolkami,
 * pływającymi odznakami (Zdawalność WORD oraz Flota identyczna z egzaminem)
 * oraz subtelnymi efektami ambient glow i szkła.
 */
export default function HeroVideoPlayer({ videoSrc }: HeroVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    setProgress((current / duration) * 100);
  };

  // Uruchomienie autoodtwarzania po zamontowaniu
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Niektóre przeglądarki blokują autoplay bez muted
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    }
  }, []);

  return (
    <div className="relative w-full group">
      {/* Efekt ambient glow za odtwarzaczem wideo */}
      <div
        className="absolute -inset-2 rounded-[2rem] bg-linear-to-tr from-blue-600/20 via-indigo-500/15 to-sky-400/20 blur-2xl -z-10 group-hover:from-blue-600/30 group-hover:to-sky-400/30 transition-all duration-500"
        aria-hidden="true"
      />

      {/* Kontener główny wideo */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl aspect-16/10 sm:aspect-16/10 lg:aspect-4/3 flex items-center justify-center">
        {/* Element HTML5 Video */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover object-center select-none"
        />

        {/* Cień wewnętrzny i subtelny gradient dla czytelności odznak */}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20 pointer-events-none"
          aria-hidden="true"
        />

        {/* PŁYWAJĄCA ODZNAKA: Lewy górny róg - Zdawalność WORD (jak na makiecie) */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-slate-900/10 flex items-center gap-3 select-none hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-center size-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 shadow-xs">
            <Star className="size-5 fill-blue-700 dark:fill-blue-400" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">
              98.4%
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mt-0.5">
              Zdawalność WORD
            </div>
          </div>
        </div>

        {/* PŁYWAJĄCA ODZNAKA: Prawy dolny róg - Flota 2024 / Identyczna z egzaminem (jak na makiecie) */}
        <div className="absolute bottom-12 right-4 sm:bottom-14 sm:right-6 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-slate-900/10 flex items-center gap-3 select-none hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-center size-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 shadow-xs">
            <CarFront className="size-5" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-none">
              Flota 2024
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mt-0.5">
              Identyczna z egzaminem
            </div>
          </div>
        </div>

        {/* Pasek kontrolek na dole wideo z paskiem postępu */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-2 sm:p-3 bg-linear-to-t from-black/80 to-transparent flex flex-col gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Pasek postępu odtwarzania */}
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Przyciski Play/Pause oraz Dźwięk */}
          <div className="flex items-center justify-between text-white text-xs px-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Wstrzymaj wideo" : "Odtwórz wideo"}
                title={isPlaying ? "Wstrzymaj wideo" : "Odtwórz wideo"}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 backdrop-blur-xs transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Włącz dźwięk" : "Wycisz dźwięk"}
                title={isMuted ? "Włącz dźwięk" : "Wycisz dźwięk"}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 backdrop-blur-xs transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>

              <span className="text-[11px] font-medium text-white/80 hidden sm:inline-block">
                Pojazd szkoleniowy w akcji
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-600/80 text-[10px] font-semibold tracking-wider uppercase text-white backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
              Wideo HD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
