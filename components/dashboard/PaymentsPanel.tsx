"use client";

/**
 * Tabela płatności w panelu administracyjnym.
 *
 * Źródłem są zapisy na kurs (`enrollments`) — każdy zapis zawiera cenę,
 * plan rat i status. Kwoty i daty są już zagregowane po stronie serwera,
 * komponent wyłącznie je prezentuje.
 */

import { BadgeCheck, CreditCard } from "lucide-react";
import {
  ENROLLMENT_STATUS_CLASS,
  ENROLLMENT_STATUS_LABEL,
  formatIsoDay,
} from "@/lib/firebase/collections";
import { formatCurrency, type PaymentRow } from "@/lib/dashboard";

interface PaymentsPanelProps {
  payments: PaymentRow[];
  isLoading: boolean;
}

export default function PaymentsPanel({ payments, isLoading }: PaymentsPanelProps) {
  const total = payments.reduce(
    (sum, payment) => sum + (payment.status === "anulowany" ? 0 : payment.price),
    0,
  );

  return (
    <section
      aria-label="Płatności"
      className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <CreditCard
            className="size-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-foreground">Płatności</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Zarejestrowane wpływy:{" "}
          <span className="font-bold text-foreground">{formatCurrency(total)}</span>
        </p>
      </header>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
          Brak zarejestrowanych płatności — pojawią się tutaj po pierwszych
          zapisach na kurs.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Kursant
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Kurs
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Kwota
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Plan
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Data zapisu
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {payments.map((payment) => (
                <tr key={payment.id} className="align-middle">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-foreground">
                      {payment.studentName}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {payment.reference}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <span
                        aria-hidden="true"
                        className="flex size-6 items-center justify-center rounded-md bg-blue-600 text-[9px] font-black text-white"
                      >
                        {payment.courseCode}
                      </span>
                      <span className="line-clamp-1">{payment.courseTitle}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-foreground">
                    {formatCurrency(payment.price)}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {payment.installments > 1
                      ? `${payment.installments} × ${formatCurrency(payment.monthly)}`
                      : "Jednorazowo"}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {payment.enrolledAt ? formatIsoDay(payment.enrolledAt) : "—"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        ENROLLMENT_STATUS_CLASS[payment.status] ??
                        ENROLLMENT_STATUS_CLASS.w_realizacji
                      }`}
                    >
                      {payment.status === "zakonczony" ? (
                        <BadgeCheck className="size-3" aria-hidden="true" />
                      ) : null}
                      {ENROLLMENT_STATUS_LABEL[payment.status] ?? "W realizacji"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
