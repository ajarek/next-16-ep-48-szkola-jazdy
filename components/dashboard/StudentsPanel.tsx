"use client";

/**
 * Lista kursantów w panelu administracyjnym: konto, kontakt,
 * liczba zapisów, średnia postęp i wpłacona kwota.
 */

import { Users } from "lucide-react";
import { formatIsoDay } from "@/lib/firebase/collections";
import { formatCurrency, type StudentRow } from "@/lib/dashboard";

interface StudentsPanelProps {
  students: StudentRow[];
  isLoading: boolean;
}

function initialsFrom(source: string): string {
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return "K";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function StudentsPanel({ students, isLoading }: StudentsPanelProps) {
  return (
    <section
      aria-label="Kursanci"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <Users
            className="size-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-foreground">Kursanci</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {students.length} kont w systemie
        </p>
      </header>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
          Brak zarejestrowanych kursantów. Pierwsze konto powstanie po
          rejestracji przez formularz.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border/60">
          {students.map((student) => {
            const percent = Math.round(student.progress * 100);
            return (
              <li key={student.uid} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-700 to-blue-500 text-[11px] font-black text-white"
                  >
                    {initialsFrom(student.name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {student.name}
                      </p>
                      <p className="text-[11px] font-semibold text-foreground">
                        {formatCurrency(student.paid)}
                      </p>
                    </div>

                    <p className="truncate text-[11px] text-muted-foreground">
                      {student.email || "brak adresu e-mail"}
                      {student.phone ? ` • ${student.phone}` : ""}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <div
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Średni postęp kursów ${student.name}`}
                        className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
                      >
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500 motion-reduce:transition-none"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-24 shrink-0 text-right text-[10px] text-muted-foreground">
                        {student.activeEnrollments}/{student.enrollments} kursów •{" "}
                        {percent}%
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!isLoading && students.length > 0 ? (
        <p className="mt-4 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
          Ostatnia rejestracja:{" "}
          <span className="font-semibold text-foreground">
            {students[0]?.createdAt ? formatIsoDay(students[0].createdAt) : "—"}
          </span>
        </p>
      ) : null}
    </section>
  );
}
