"use client";

/**
 * Przycisk „Zapisz się na kurs” na kartach kategorii (/categories).
 *
 * - dla gościa: przekierowuje do logowania (zapis wymaga konta),
 * - dla kursanta: wywołuje Server Action `enrollCourse`, która tworzy
 *   dokument w kolekcji `enrollments` powiązany z `courses` i `users`,
 * - po zapisie przycisk pokazuje stan posiadania kursu i link do panelu.
 *
 * Stan „już zapisany” jest odczytywany z Firestore filtrem po `userId`
 * i `courseId` — reguły bezpieczeństwa dopuszczają wyłącznie zapytanie
 * ograniczone do własnych dokumentów.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getFirebaseDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { enrollCourse } from "@/app/categories/actions";

interface EnrollButtonProps {
  /** Identyfikator kursu w katalogu — zgodny z `categories-data.json`. */
  courseId: string;
}

type Notice = { tone: "success" | "error"; text: string } | null;

export default function EnrollButton({ courseId }: EnrollButtonProps) {
  const router = useRouter();
  const { user, configured, getIdToken } = useAuth();

  const [checkedForUid, setCheckedForUid] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  /* ── Sprawdzenie, czy kursant ma już ten kurs ─────────────── */
  // Efekt wyłącznie podpina zapytanie do Firestore — stan zmienia się
  // w callbackach (po odpowiedzi serwera), nie w ciele efektu.
  // `checkedForUid` chroni przed pokazaniem zapisu innego konta.
  useEffect(() => {
    if (!configured || !user) return;

    let cancelled = false;
    const uid = user.uid;

    getDocs(
      query(
        collection(getFirebaseDb(), COLLECTIONS.enrollments),
        where("userId", "==", uid),
        where("courseId", "==", courseId),
      ),
    ).then(
      (snapshot) => {
        if (cancelled) return;
        setIsEnrolled(!snapshot.empty);
        setCheckedForUid(uid);
      },
      () => {
        // Brak uprawnień lub błąd sieci — traktujemy jak brak zapisu,
        // a Server Action i tak zweryfikuje stan przed utworzeniem dokumentu.
        if (cancelled) return;
        setIsEnrolled(false);
        setCheckedForUid(uid);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [configured, user, courseId]);

  // Stan odczytany dotyczy wyłącznie aktualnego konta.
  const alreadyEnrolled =
    user !== null && checkedForUid === user.uid && isEnrolled;
  const isChecking =
    Boolean(configured) && user !== null && checkedForUid !== user.uid;

  const handleEnroll = async () => {
    // Zapis na kurs wymaga konta — gość trafia do logowania i wraca tutaj.
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/categories")}`);
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      const idToken = await getIdToken();
      const result = await enrollCourse(courseId, idToken);

      if (result.ok) {
        setIsEnrolled(true);
        setCheckedForUid(user.uid);
        setNotice({
          tone: "success",
          text: result.reference
            ? `${result.message} Numer zapisu: ${result.reference}.`
            : result.message,
        });
      } else {
        setNotice({ tone: "error", text: result.message });
      }
    } catch {
      setNotice({
        tone: "error",
        text: "Nie udało się połączyć z serwerem. Odśwież stronę i spróbuj ponownie.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isChecking;

  return (
    <div className="space-y-2">
      {isChecking ? (
        <div
          aria-hidden="true"
          className="h-11 w-full animate-pulse rounded-xl bg-muted"
        />
      ) : alreadyEnrolled ? (
        <>
          <p className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            Masz ten kurs
          </p>
          <Link
            href="/account"
            className="group/enroll flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Zobacz w panelu kursanta
            <ArrowRight
              className="size-3.5 group-hover/enroll:translate-x-1 transition-transform duration-200"
              aria-hidden="true"
            />
          </Link>
        </>
      ) : (
        <button
          type="button"
          onClick={() => void handleEnroll()}
          disabled={isBusy}
          className="group/enroll flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <GraduationCap className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Zapisywanie…" : "Zapisz się na kurs"}
          {!isSubmitting ? (
            <ArrowRight
              className="size-4 group-hover/enroll:translate-x-1 transition-transform duration-200"
              aria-hidden="true"
            />
          ) : null}
        </button>
      )}

      {notice ? (
        <p
          role="status"
          className={`flex items-start gap-2 rounded-xl border p-2.5 text-[11px] leading-relaxed ${
            notice.tone === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"
          }`}
        >
          <span>{notice.text}</span>
        </p>
      ) : null}

      {!user && configured && !notice ? (
        <p className="text-center text-[11px] leading-snug text-muted-foreground">
          Zapis wymaga zalogowania — przekierujemy Cię na stronę logowania.
        </p>
      ) : null}
    </div>
  );
}
