"use client";

/**
 * Zestawienie katalogu kursów: liczba zapisów, zapisy aktywne,
 * przychód i udział procentowy w łącznym przychodzie szkoły.
 */

import { BookOpen } from "lucide-react";
import { formatCurrency, type CourseStat } from "@/lib/dashboard";

interface CoursesBoardProps {
  courses: CourseStat[];
  isLoading: boolean;
}

export default function CoursesBoard({ courses, isLoading }: CoursesBoardProps) {
  return (
    <section
      aria-label="Kursy — zapisy i przychód"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen
            className="size-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-foreground">
            Kursy — zapisy i przychód
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {courses.length} pozycji w katalogu
        </p>
      </header>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
          Katalog kursów jest pusty — dodaj pierwszy kurs w kolekcji{" "}
          <code className="font-mono">courses</code>.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-2xl border border-border/70 bg-muted/30 p-4 transition-colors hover:bg-muted/60"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-sm shadow-blue-600/25"
                  >
                    {course.code}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {course.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {course.active ? "W ofercie" : "Wycofany z oferty"} •
                      cena katalogowa {formatCurrency(course.price)}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    course.active
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {course.active ? "Aktywny" : "Nieaktywny"}
                </span>
              </div>

              {/* Udział w przychodzie */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-muted-foreground">
                    Udział w przychodzie
                  </span>
                  <span className="font-bold text-foreground">
                    {Math.round(course.share * 100)}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={Math.round(course.share * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Udział kursu ${course.code} w przychodzie`}
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500 motion-reduce:transition-none"
                    style={{ width: `${Math.max(Math.round(course.share * 100), 1)}%` }}
                  />
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground sm:grid-cols-4">
                <div>
                  <dt className="font-semibold text-foreground">Zapisy</dt>
                  <dd>{course.enrollments}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">W toku</dt>
                  <dd>{course.activeEnrollments}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Ukończone</dt>
                  <dd>{course.completedEnrollments}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Przychód</dt>
                  <dd className="font-semibold text-foreground">
                    {formatCurrency(course.revenue)}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
