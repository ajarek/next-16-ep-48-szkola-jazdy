"use client";

/**
 * Lista zakupionych kursów zalogowanego kursanta.
 *
 * Źródła danych (połączenie obu kolekcji):
 *  - `enrollments` — zapisy własne (filtr po `userId`),
 *  - `courses` — katalog oferty wzbogacający kartę o program i czas trwania,
 *  - `lessons` — jazdy powiązane z kursem (po `categoryLabel`) do postępu.
 */

import Link from "next/link";
import { ArrowUpRight, BookOpen, Car, GraduationCap } from "lucide-react";
import {
  ENROLLMENT_STATUS_CLASS,
  ENROLLMENT_STATUS_LABEL,
  computeEnrollmentProgress,
  formatIsoDay,
  summarizeEnrollmentDrives,
  type CourseDoc,
  type EnrollmentDoc,
  type EnrollmentStatus,
  type LessonDoc,
} from "@/lib/firebase/collections";
import { formatPrice } from "@/lib/categories";

interface CoursesListProps {
  enrollments: EnrollmentDoc[];
  courses: CourseDoc[];
  lessons: LessonDoc[];
  isLoading: boolean;
}

/** Kolejność wyświetlania: kursy aktywne najwyżej, potem po dacie zapisu. */
const STATUS_ORDER: Record<EnrollmentStatus, number> = {
  w_realizacji: 0,
  zakonczony: 1,
  anulowany: 2,
};

/** Etykieta planu płatności, np. „6 × 583 zł/mc”. */
function paymentLabel(enrollment: EnrollmentDoc): string {
  if (enrollment.installments > 1) {
    const installment = Math.round(enrollment.price / enrollment.installments);
    return `${enrollment.installments} × ${formatPrice(installment)} zł/mc`;
  }
  return "Jednorazowo";
}

export default function CoursesList({
  enrollments,
  courses,
  lessons,
  isLoading,
}: CoursesListProps) {
  const coursesById = new Map(courses.map((course) => [course.id, course]));

  const sorted = [...enrollments].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return b.enrolledAt.localeCompare(a.enrolledAt);
  });

  return (
    <section
      aria-label="Moje kursy"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <GraduationCap
            className="size-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-foreground">Moje kursy</h2>
        </div>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          Katalog kursów
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </header>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[0, 1].map((index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <BookOpen className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Nie masz jeszcze żadnego kursu
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Wybierz kategorię w katalogu — zapis trafi na Twoje konto i pojawi
            się tutaj wraz z postępem szkolenia.
          </p>
          <Link
            href="/categories"
            className="mt-4 inline-flex items-center rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Przeglądaj katalog
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {sorted.map((enrollment) => {
            const course = coursesById.get(enrollment.courseId);
            const progress = computeEnrollmentProgress(enrollment, lessons);
            const drives = summarizeEnrollmentDrives(enrollment, lessons);
            const percent = Math.round(progress * 100);

            return (
              <li
                key={enrollment.id}
                className="rounded-2xl border border-border/70 bg-muted/30 p-4 transition-colors hover:bg-muted/60"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-sm shadow-blue-600/25"
                    >
                      {enrollment.courseCode}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        {course?.title ?? enrollment.courseTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {enrollment.categoryLabel} • zapis{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {enrollment.reference}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      ENROLLMENT_STATUS_CLASS[enrollment.status] ??
                      ENROLLMENT_STATUS_CLASS.w_realizacji
                    }`}
                  >
                    {ENROLLMENT_STATUS_LABEL[enrollment.status] ?? "W realizacji"}
                  </span>
                </div>

                {/* Postęp kursu */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-muted-foreground">
                      Postęp kursu
                    </span>
                    <span className="font-bold text-foreground">{percent}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Postęp kursu ${enrollment.courseCode}`}
                    className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {drives.total > 0 ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Car className="size-3.5" aria-hidden="true" />
                      Jazdy: {drives.completed} zaliczonych z {drives.total}
                    </p>
                  ) : null}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground sm:grid-cols-4">
                  <div>
                    <dt className="font-semibold text-foreground">
                      Rozpoczęcie
                    </dt>
                    <dd>{formatIsoDay(enrollment.enrolledAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">
                      Czas trwania
                    </dt>
                    <dd>{course?.durationLabel ?? "wg harmonogramu"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Płatność</dt>
                    <dd>{paymentLabel(enrollment)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Cena</dt>
                    <dd className="font-semibold text-foreground">
                      {formatPrice(enrollment.price)} zł
                    </dd>
                  </div>
                </dl>

                {course && course.modules.length > 0 ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Program:
                    </span>{" "}
                    {course.modules.slice(0, 3).join(" • ")}
                    {course.modules.length > 3 ? " …" : ""}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
