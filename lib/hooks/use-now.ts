"use client";

import { useEffect, useState } from "react";

/**
 * Zwraca bieżący czas (ms) odświeżany co `intervalMs`.
 *
 * Bezpieczny względem reguł Reacta: stan inicjalizowany jest leniwie
 * (pierwsze odczytanie zegara), a cykliczne odświeżanie odbywa się
 * w callbacku timera, czyli poza renderem. Dzięki temu komponenty
 * mogą porównywać daty zajęć z „teraz” bez wywoływania niestabilnych
 * funkcji w trakcie renderowania.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
