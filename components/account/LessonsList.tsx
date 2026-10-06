"use client";

/**
 * Harmonogram zajęć: nadchodzące jazdy i wykłady oraz historia.
 * Dane pochodzą z kolekcji `lessons`.
 */

import { CalendarDays, CalendarOff, PartyPopper } from "lucide-react";
import {
  LESSON_STATUS_CLASS,
  LESSON_STATUS_LABEL,
  LESSON_TYPE_LABEL,
  formatIsoDate,
  type LessonDoc,
} from "@/lib/firebase/collections";
import { useNow } from "@/lib/hooks/use-now";

interface LessonsListProps {
  lessons: LessonDoc[];
  isLoading: boolean;
}

export default function LessonsList({ lessons, isLoading }: LessonsListProps) {
  const now = useNow();
  const upcoming = lessons.filter(
    (lesson) =>
      lesson.status === "zaplanowane" &&
      new Date(lesson.startsAt).getTime() >= now,
  );
  const past = lessons
    .filter(
      (lesson) =>
        lesson.status !== "zaplanowane" ||
        new Date(lesson.startsAt).getTime() < now,
    )
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  return (
    <section
      aria-label="Harmonogram zajęć"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex items-center gap-2 pb-4 border-b border-border/60">
        <CalendarDays
          className="size-5 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        <h2 className="text-base font-bold text-foreground">Harmonogram jazd</h2>
      </header>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <CalendarOff className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Brak zaplanowanych zajęć
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Terminy jazd ustalamy telefonicznie w ciągu 24 godzin od
            potwierdzenia zgłoszenia.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Nadchodzące
            </h3>
            {upcoming.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Nie masz zaplanowanych zajęć. Zadzwoń, aby ustalić termin:
                +48 573 219 230.
              </p>
            ) : (
              <ul className="mt-2 space-y-2.5">
                {upcoming.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-blue-500/25 bg-blue-500/5 p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">
                        {lesson.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {LESSON_TYPE_LABEL[lesson.type]} • {lesson.instructor} •{" "}
                        {lesson.durationMin} min
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold text-foreground">
                        {formatIsoDate(lesson.startsAt)}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                          LESSON_STATUS_CLASS[lesson.status]
                        }`}
                      >
                        {LESSON_STATUS_LABEL[lesson.status]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {past.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Historia
              </h3>
              <ul className="mt-2 space-y-2">
                {past.slice(0, 6).map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {lesson.title}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {formatIsoDate(lesson.startsAt)} • {lesson.instructor}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        LESSON_STATUS_CLASS[lesson.status]
                      }`}
                    >
                      {lesson.status === "zaliczone" ? (
                        <PartyPopper className="size-3" aria-hidden="true" />
                      ) : null}
                      {LESSON_STATUS_LABEL[lesson.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
