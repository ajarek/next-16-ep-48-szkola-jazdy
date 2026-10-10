/**
 * Logika biznesowa panelu administracyjnego `/dashboard`.
 *
 * Plik zawiera wyłącznie czyste typy i funkcje agregacyjne — bez importów
 * Firebase — dzięki czemu może być używany zarówno po stronie serwera
 * (Server Action agregujący dane z Firestore), jak i po stronie klienta
 * (wyświetlanie wyników w komponentach).
 */

import {
  computeEnrollmentProgress,
  type ApplicationDoc,
  type ContactMessageDoc,
  type CourseDoc,
  type EnrollmentDoc,
  type LessonDoc,
  type UserProfile,
} from "@/lib/firebase/collections";

/** Adres konta z dostępem do panelu administracyjnego. */
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

/**
 * Krótkie nazwy miesięcy po polsku.
 * Stała tablica zamiast `Intl` — identyczny wynik na serwerze i kliencie
 * (bez różnic formatowania i bez ryzyka błędu hydratacji).
 */
const MONTH_LABELS = [
  "sty",
  "lut",
  "mar",
  "kwi",
  "maj",
  "cze",
  "lip",
  "sie",
  "wrz",
  "paź",
  "lis",
  "gru",
] as const;

/** Czy adres e-mail należy do konta administracyjnego. */
export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
}

/**
 * Normalizuje datę pochodzącą z Firestore do stringa w formacie ISO.
 * Obsługuje zarówno stringi (dokumenty zapisane przez Server Actions),
 * jak i obiekty `Timestamp` (zapisane np. z poziomu konsoli Firebase).
 */
export function toIsoDate(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object") {
    const maybe = value as { toDate?: () => Date };
    if (typeof maybe.toDate === "function") {
      try {
        return maybe.toDate().toISOString();
      } catch {
        return "";
      }
    }
  }
  return "";
}

/** Formatuje kwotę w złotych, np. 12500 -> „12 500 zł”. */
export function formatCurrency(value: number): string {
  return `${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} zł`;
}

/** Klucz miesiąca w formacie „RRRR-MM”. */
function monthKeyOf(iso: string): string {
  return iso.slice(0, 7);
}

/** Rata miesięczna zapisu (przy ratach 0%) — pełna cena dla płatności jednorazowej. */
export function installmentOf(enrollment: EnrollmentDoc): number {
  if (enrollment.installments > 1) {
    return Math.round(enrollment.price / enrollment.installments);
  }
  return enrollment.price;
}

/** Kwota zapisu wliczana do przychodu (zapisy anulowane nie liczą się). */
export function revenueOf(enrollment: EnrollmentDoc): number {
  return enrollment.status === "anulowany" ? 0 : enrollment.price;
}

/* ── Typy wyniku agregacji ──────────────────────────────────── */

export interface DashboardStats {
  /** Liczba kont kursantów (bez kont administracyjnych). */
  studentsTotal: number;
  /** Kursanci zarejestrowani w bieżącym miesiącu. */
  studentsNewThisMonth: number;
  /** Zapisy w toku. */
  enrollmentsActive: number;
  /** Wszystkie zapisy (w tym anulowane). */
  enrollmentsTotal: number;
  /** Przychód z zapisów nieanulowanych (zakończone + w toku). */
  revenueTotal: number;
  /** Przychód z zapisów zakończonych. */
  revenueCollected: number;
  /** Przychód oczekujący z zapisów w realizacji. */
  revenueOpen: number;
  /** Suma prognozowanych rat miesięcznych z czynnych zapisów. */
  monthlyInstallments: number;
  /** Zgłoszenia ze statusem „nowy”. */
  applicationsNew: number;
  /** Zgłoszenia z ostatnich 7 dni. */
  applicationsLast7Days: number;
  /** Wiadomości kontaktowe ze statusem „nowa”. */
  messagesNew: number;
  /** Jazdy / wykłady zaplanowane w przyszłości. */
  lessonsUpcoming: number;
  /** Odsetek zaliczonych jazd (bez jazd odwołanych), 0–1. */
  drivePassRate: number;
}

/** Miesięczna seria przychodu z zapisów (ostatnie 6 miesięcy). */
export interface RevenuePoint {
  /** Klucz miesiąca „RRRR-MM”. */
  monthKey: string;
  /** Etykieta do wyświetlenia, np. „paź”. */
  label: string;
  revenue: number;
  enrollments: number;
}

/** Zagregowane dane katalogu kursów. */
export interface CourseStat {
  id: string;
  code: string;
  title: string;
  active: boolean;
  price: number;
  /** Wszystkie zapisy na kurs. */
  enrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  canceledEnrollments: number;
  revenue: number;
  /** Udział kursu w łącznym przychodzie, 0–1. */
  share: number;
}

/** Wiersz tabeli kursantów. */
export interface StudentRow {
  uid: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  /** Łączna liczba zapisów. */
  enrollments: number;
  activeEnrollments: number;
  /** Średni postęp czynnych kursów, 0–1. */
  progress: number;
  /** Suma wartości zapisów nieanulowanych. */
  paid: number;
}

/** Wiersz tabeli płatności (zapisy na kurs). */
export interface PaymentRow {
  id: string;
  reference: string;
  studentName: string;
  courseCode: string;
  courseTitle: string;
  price: number;
  installments: number;
  monthly: number;
  status: EnrollmentDoc["status"];
  enrolledAt: string;
}

/** Pełny wynik agregacji panelu administracyjnego. */
export interface AdminOverview {
  /** Moment wygenerowania danych (ISO). */
  generatedAt: string;
  stats: DashboardStats;
  revenueSeries: RevenuePoint[];
  courses: CourseStat[];
  students: StudentRow[];
  payments: PaymentRow[];
  recentApplications: ApplicationDoc[];
  openMessages: ContactMessageDoc[];
}

/** Dane wejściowe agregacji — dokumenty pobrane z Firestore. */
export interface AdminDataInput {
  users: UserProfile[];
  courses: CourseDoc[];
  enrollments: EnrollmentDoc[];
  applications: ApplicationDoc[];
  lessons: LessonDoc[];
  messages: ContactMessageDoc[];
}

/* ── Agregacja ──────────────────────────────────────────────── */

/**
 * Buduje pełny widok panelu administracyjnego z dokumentów Firestore.
 * Wszystkie wyliczenia są deterministyczne względem przekazanego `now`
 * (domyślnie bieżący moment), dzięki czemu funkcja jest testowalna.
 */
export function buildAdminOverview(
  input: AdminDataInput,
  now: Date = new Date(),
): AdminOverview {
  const { users, courses, enrollments, applications, lessons, messages } =
    input;
  const nowIso = now.toISOString();
  const currentMonthKey = monthKeyOf(nowIso);
  const weekAgoIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const usersByUid = new Map(
    users.filter((profile) => Boolean(profile?.uid)).map((profile) => [profile.uid, profile]),
  );

  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === "w_realizacji",
  );
  const validEnrollments = enrollments.filter(
    (enrollment) => enrollment.status !== "anulowany",
  );

  const revenueCollected = validEnrollments
    .filter((enrollment) => enrollment.status === "zakonczony")
    .reduce((sum, enrollment) => sum + revenueOf(enrollment), 0);
  const revenueOpen = activeEnrollments.reduce(
    (sum, enrollment) => sum + revenueOf(enrollment),
    0);
  const monthlyInstallments = activeEnrollments.reduce(
    (sum, enrollment) =>
      sum + (enrollment.installments > 1 ? installmentOf(enrollment) : 0),
    0,
  );

  /* ── Seria przychodu z ostatnich 6 miesięcy ── */
  const revenueSeries: RevenuePoint[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const items = validEnrollments.filter(
      (enrollment) => monthKeyOf(toIsoDate(enrollment.enrolledAt)) === monthKey,
    );
    revenueSeries.push({
      monthKey,
      label: MONTH_LABELS[date.getMonth()],
      revenue: items.reduce((sum, enrollment) => sum + revenueOf(enrollment), 0),
      enrollments: items.length,
    });
  }

  /* ── Kursanci ── */
  const students: StudentRow[] = users
    .filter((profile) => profile?.role !== "admin")
    .map((profile) => {
      const own = enrollments.filter(
        (enrollment) => enrollment.userId === profile.uid,
      );
      const active = own.filter(
        (enrollment) => enrollment.status === "w_realizacji",
      );
      const progressBase = active.length > 0 ? active : own;
      const progress =
        progressBase.length > 0
          ? progressBase.reduce(
              (sum, enrollment) =>
                sum + computeEnrollmentProgress(enrollment, lessons),
              0,
            ) / progressBase.length
          : 0;

      return {
        uid: profile.uid,
        name: profile.displayName?.trim() || profile.email || "Kursant",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        createdAt: toIsoDate(profile.createdAt),
        enrollments: own.length,
        activeEnrollments: active.length,
        progress,
        paid: own.reduce((sum, enrollment) => sum + revenueOf(enrollment), 0),
      };
    })
    .sort((a, b) => {
      if (b.paid !== a.paid) return b.paid - a.paid;
      return b.createdAt.localeCompare(a.createdAt);
    });

  /* ── Płatności ── */
  const payments: PaymentRow[] = enrollments
    .map((enrollment) => {
      const owner = usersByUid.get(enrollment.userId);
      return {
        id: enrollment.id,
        reference: enrollment.reference,
        studentName:
          owner?.displayName?.trim() || owner?.email || "Nieprzypisany",
        courseCode: enrollment.courseCode,
        courseTitle: enrollment.courseTitle,
        price: enrollment.price,
        installments: enrollment.installments,
        monthly: installmentOf(enrollment),
        status: enrollment.status,
        enrolledAt: toIsoDate(enrollment.enrolledAt),
      };
    })
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));

  /* ── Kursy ── */
  const revenueTotal = revenueCollected + revenueOpen;
  const courseStats: CourseStat[] = courses
    .map((course) => {
      const own = enrollments.filter(
        (enrollment) => enrollment.courseId === course.id,
      );
      const revenue = own.reduce(
        (sum, enrollment) => sum + revenueOf(enrollment),
        0,
      );
      return {
        id: course.id,
        code: course.code,
        title: course.title,
        active: course.active,
        price: course.price,
        enrollments: own.length,
        activeEnrollments: own.filter(
          (enrollment) => enrollment.status === "w_realizacji",
        ).length,
        completedEnrollments: own.filter(
          (enrollment) => enrollment.status === "zakonczony",
        ).length,
        canceledEnrollments: own.filter(
          (enrollment) => enrollment.status === "anulowany",
        ).length,
        revenue,
        share: revenueTotal > 0 ? revenue / revenueTotal : 0,
      };
    })
    .sort((a, b) => {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      return b.enrollments - a.enrollments;
    });

  /* ── Zajęcia i pipeline ── */
  const drives = lessons.filter(
    (lesson) => lesson.type === "jazda" && lesson.status !== "odwolane",
  );
  const completedDrives = drives.filter(
    (lesson) => lesson.status === "zaliczone",
  );
  const drivePassRate =
    drives.length > 0 ? completedDrives.length / drives.length : 0;

  const lessonsUpcoming = lessons.filter(
    (lesson) =>
      lesson.status === "zaplanowane" &&
      new Date(lesson.startsAt).getTime() >= now.getTime(),
  ).length;

  const stats: DashboardStats = {
    studentsTotal: students.length,
    studentsNewThisMonth: students.filter(
      (student) => monthKeyOf(student.createdAt) === currentMonthKey,
    ).length,
    enrollmentsActive: activeEnrollments.length,
    enrollmentsTotal: enrollments.length,
    revenueTotal,
    revenueCollected,
    revenueOpen,
    monthlyInstallments,
    applicationsNew: applications.filter(
      (application) => application.status === "nowy",
    ).length,
    applicationsLast7Days: applications.filter(
      (application) => toIsoDate(application.createdAt) >= weekAgoIso,
    ).length,
    messagesNew: messages.filter((message) => message.status === "nowy").length,
    lessonsUpcoming,
    drivePassRate,
  };

  return {
    generatedAt: nowIso,
    stats,
    revenueSeries,
    courses: courseStats,
    students,
    payments,
    recentApplications: [...applications]
      .sort((a, b) =>
        toIsoDate(b.createdAt).localeCompare(toIsoDate(a.createdAt)),
      )
      .slice(0, 6),
    openMessages: messages
      .filter((message) => message.status !== "zamknieta")
      .sort((a, b) => toIsoDate(b.createdAt).localeCompare(toIsoDate(a.createdAt)))
      .slice(0, 5),
  };
}
