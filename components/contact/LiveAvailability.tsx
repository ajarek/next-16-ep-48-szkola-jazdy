"use client";

import { useEffect, useState } from "react";
import { getOfficeStatus, ServiceStatus } from "@/lib/contact";

interface LiveAvailabilityProps {
  variant: "phone" | "office";
}

export default function LiveAvailability({ variant }: LiveAvailabilityProps) {
  const [status, setStatus] = useState<ServiceStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOfficeStatus());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (variant === "phone") {
    const open = status?.phoneOpen ?? false;
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
          status ? (open ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400") : "invisible"
        }`}
      >
        <span
          className={`size-1.5 rounded-full ${open ? "bg-emerald-500 motion-safe:animate-pulse" : "bg-amber-500"}`}
          aria-hidden="true"
        />
        {status ? (open ? "czynna" : "poza godzinami") : "czynna"}
      </span>
    );
  }

  const open = status ? status.officeOpen || status.lectureOpen || status.phoneOpen : false;

  return (
    <p
      className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        status
          ? open
            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
            : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          : "invisible"
      }`}
      title={status?.detail}
    >
      <span
        className={`size-1.5 rounded-full ${open ? "bg-emerald-500" : "bg-amber-500"}`}
        aria-hidden="true"
      />
      {status ? `Teraz ${status.timeLabel} · ${status.headline}` : "Teraz 00:00 · Biuro otwarte"}
    </p>
  );
}
