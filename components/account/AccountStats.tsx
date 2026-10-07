"use client";

/**
 * Kafle ze statystykami konta: zgłoszenia, postęp szkolenia,
 * najbliższe zajęcia i liczba wiadomości.
 */

import {
  CalendarClock,
  Car,
  FileText,
  GraduationCap,
  MessagesSquare,
  TrendingUp,
} from "lucide-react";
import {
  APPLICATION_STATUS_LABEL,
  computeEnrollmentProgress,
  formatIsoDay,
  type ApplicationDoc,
  type ContactMessageDoc,
  type EnrollmentDoc,
  type LessonDoc,
} from "@/lib/firebase/collections";
import { useNow } from "@/lib/hooks/use-now";

interface AccountStatsProps {
  applications: ApplicationDoc[];
  lessons: LessonDoc[];
  messages: ContactMessageDoc[];
  enrollments: EnrollmentDoc[];
  isLoading: boolean;
}

interface StatCardProps {
  icon: typeof Car;
  label: string;
  value: string;
  hint: string;
  progress?: number;
  tone?: "blue" | "emerald" | "amber" | "violet" | "rose";
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  blue: "bg-blue-600",
  emerald: "bg-emerald-600",
  amber: "bg-amber-500",
  violet: "bg-violet-600",
  rose: "bg-rose-600",
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  progress,
  tone = "blue",
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-white ${TONES[tone]}`}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </div>

      <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p>

      {typeof progress === "number" ? (
        <div className="mt-3">
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Postęp szkolenia"
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function AccountStats({
  applications,
  lessons,
  messages,
  enrollments,
  isLoading,
}: AccountStatsProps) {
  const placeholder = isLoading ? "…" : "—";

  const lastApplication = applications[0];
  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === "w_realizacji",
  );
  const finishedEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === "zakonczony",
  );
  const averageCourseProgress =
    activeEnrollments.length > 0
      ? activeEnrollments.reduce(
          (sum, enrollment) =>
            sum + computeEnrollmentProgress(enrollment, lessons),
          0,
        ) / activeEnrollments.length
      : 0;

  const courseHint =
    enrollments.length === 0
      ? "Wybierz kurs w katalogu — pojawi się tutaj"
      : activeEnrollments.length > 0
        ? `${activeEnrollments.length} w realizacji • postęp ${Math.round(averageCourseProgress * 100)}%`
        : finishedEnrollments.length > 0
          ? `${finishedEnrollments.length} ukończonych • ${enrollments.length} łącznie`
          : "Brak kursów w realizacji";
  const drivingLessons = lessons.filter((lesson) => lesson.type === "jazda");
  const completedDrives = drivingLessons.filter(
    (lesson) => lesson.status === "zaliczone",
  );
  const progress =
    drivingLessons.length > 0
      ? completedDrives.length / drivingLessons.length
      : 0;

  const now = useNow();
  const nextLesson = lessons.find(
    (lesson) =>
      lesson.status === "zaplanowane" &&
      new Date(lesson.startsAt).getTime() >= now,
  );

  return (
    <section aria-label="Statystyki konta" className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={FileText}
          label="Zgłoszenia"
          value={isLoading ? placeholder : String(applications.length)}
          hint={
            lastApplication
              ? `Ostatnie: ${APPLICATION_STATUS_LABEL[lastApplication.status]} (${lastApplication.reference})`
              : "Nie złożono jeszcze żadnego zgłoszenia"
          }
          tone="blue"
        />

        <StatCard
          icon={GraduationCap}
          label="Moje kursy"
          value={isLoading ? placeholder : String(enrollments.length)}
          hint={courseHint}
          progress={
            enrollments.length === 0
              ? undefined
              : activeEnrollments.length > 0
                ? averageCourseProgress
                : 1
          }
          tone="rose"
        />

        <StatCard
          icon={TrendingUp}
          label="Postęp szkolenia"
          value={
            isLoading
              ? placeholder
              : `${completedDrives.length} / ${drivingLessons.length}`
          }
          hint={
            drivingLessons.length > 0
              ? `Zaliczone jazdy: ${Math.round(progress * 100)}%`
              : "Grafik jazd pojawi się po potwierdzeniu zgłoszenia"
          }
          progress={progress}
          tone="emerald"
        />

        <StatCard
          icon={CalendarClock}
          label="Najbliższe zajęcia"
          value={
            isLoading
              ? placeholder
              : nextLesson
                ? formatIsoDay(nextLesson.startsAt)
                : "Brak"
          }
          hint={
            nextLesson
              ? `${nextLesson.title} • ${nextLesson.instructor}`
              : "Ustalimy termin telefonicznie"
          }
          tone="amber"
        />

        <StatCard
          icon={MessagesSquare}
          label="Wiadomości"
          value={isLoading ? placeholder : String(messages.length)}
          hint={
            messages.length > 0
              ? `Ostatnia: ${messages[0].topicLabel}`
              : "Napisz do koordynatora, gdy masz pytanie"
          }
          tone="violet"
        />
      </div>

      {drivingLessons.length > 0 && !isLoading ? (
        <p className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Car className="size-3.5" aria-hidden="true" />
          Łącznie zaplanowanych jazd: {drivingLessons.length} • zaliczonych:{" "}
          {completedDrives.length} • odwołanych:{" "}
          {
            lessons.filter((lesson) => lesson.status === "odwolane").length
          }
        </p>
      ) : null}
    </section>
  );
}
