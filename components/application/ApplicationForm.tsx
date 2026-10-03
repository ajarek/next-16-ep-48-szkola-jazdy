"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  Calendar,
  Phone,
  Mail,
  HelpCircle,
  Car,
  Truck,
  Bus,
  Clock,
  Sunrise,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  ArrowRight,
  Lock,
  Container,
  IdCard,
} from "lucide-react";
import {
  ApplicationData,
  ApplicationCategory,
  applicationSchema,
  ApplicationFormValues,
} from "@/lib/application";
import PkkInfoModal from "./PkkInfoModal";
import ApplicationSuccessModal from "./ApplicationSuccessModal";

interface ApplicationFormProps {
  data: ApplicationData;
}

export default function ApplicationForm({ data }: ApplicationFormProps) {
  // Stan formularza
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cat-b");
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("day");

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pkkNumber, setPkkNumber] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modale
  const [isPkkModalOpen, setIsPkkModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    fullName: string;
    phone: string;
    email: string;
    category: ApplicationCategory;
    timeSlotTitle: string;
    reservationId: string;
  } | null>(null);

  // Wybrana kategoria
  const selectedCategory =
    data.categories.find((c) => c.id === selectedCategoryId) || data.categories[0];

  // Wybrana pora dnia
  const selectedTimeSlot =
    data.timePreferences.find((t) => t.id === selectedTimeSlotId) ||
    data.timePreferences[1];

  // Mapowanie ikon kategorii
  const renderCategoryIcon = (icon: ApplicationCategory["icon"], isSelected: boolean) => {
    const iconClass = isSelected ? "text-white" : "text-blue-600 dark:text-blue-400";
    switch (icon) {
      case "Car":
        return <Car className={`size-5 ${iconClass}`} />;
      case "Truck":
        return <Truck className={`size-5 ${iconClass}`} />;
      case "Trailer":
        return <Container className={`size-5 ${iconClass}`} />;
      case "Bus":
        return <Bus className={`size-5 ${iconClass}`} />;
      default:
        return <Car className={`size-5 ${iconClass}`} />;
    }
  };

  // Mapowanie ikon pory dnia
  const renderTimeIcon = (icon: "Sunrise" | "Sun" | "Moon", isSelected: boolean) => {
    const iconClass = isSelected ? "text-white" : "text-amber-500 dark:text-amber-400";
    switch (icon) {
      case "Sunrise":
        return <Sunrise className={`size-5 ${iconClass}`} />;
      case "Sun":
        return <Sun className={`size-5 ${iconClass}`} />;
      case "Moon":
        return <Moon className={`size-5 ${isSelected ? "text-white" : "text-indigo-400"}`} />;
      default:
        return <Sun className={`size-5 ${iconClass}`} />;
    }
  };

  // Formatowanie numeru PKK (np. 12345 67890 12345 67890)
  const handlePkkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 20);
    const parts = raw.match(/[\s\S]{1,5}/g) || [];
    setPkkNumber(parts.join(" "));
  };

  // Walidacja i wysyłka formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formValues: ApplicationFormValues = {
      fullName: fullName.trim(),
      age: age.trim(),
      phone: phone.trim(),
      email: email.trim(),
      pkkNumber: pkkNumber.trim(),
      categoryId: selectedCategoryId,
      timeSlot: selectedTimeSlotId,
    };

    const validationResult = applicationSchema.safeParse(formValues);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Symulacja szybkiego zapisu w 600ms
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedId = Math.floor(1000 + Math.random() * 9000).toString();
      setSubmittedData({
        fullName: formValues.fullName,
        phone: formValues.phone,
        email: formValues.email,
        category: selectedCategory,
        timeSlotTitle: `${selectedTimeSlot.title} (${selectedTimeSlot.hours})`,
        reservationId: `APX-${generatedId}`,
      });
      setIsSuccessModalOpen(true);
    }, 600);
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* LEWA I ŚRODKOWA SEKCJA FORMULARZA (POŁĄCZONE W JEDNĄ KARTĘ)     */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 bg-card border border-border/80 rounded-3xl shadow-sm p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {/* ──────────────────────────────────────────────────────── */}
              {/* KOLUMNA 1: DANE OSOBOWE KURSANTA                          */}
              {/* ──────────────────────────────────────────────────────── */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                  <IdCard className="size-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Dane osobowe kursanta
                  </h2>
                </div>

                {/* Pole 1: Imię i Nazwisko */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="fullName"
                      className="text-xs font-semibold text-foreground flex items-center gap-1"
                    >
                      Imię i Nazwisko <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground">zgodnie z dowodem</span>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                      placeholder="Wpisz swoje Imię i Nazwisko"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-background ${
                        errors.fullName ? "border-red-500 focus:ring-red-500" : "border-border"
                      }`}
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName}</p>
                  )}
                </div>

                {/* Pole 2: Wiek */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="age"
                      className="text-xs font-semibold text-foreground flex items-center gap-1"
                    >
                      Wiek <span className="text-red-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Clock className="size-3" />
                      -3 m-ce przed 18-tką
                    </span>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      id="age"
                      type="number"
                      min="17"
                      max="99"
                      value={age}
                      onChange={(e) => {
                        setAge(e.target.value);
                        if (errors.age) setErrors((prev) => ({ ...prev, age: "" }));
                      }}
                      placeholder="Wpisz wiek"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-background ${
                        errors.age ? "border-red-500 focus:ring-red-500" : "border-border"
                      }`}
                      required
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                    Kurs kat. B możesz rozpocząć mając ukończone 17 lat i 9 miesięcy.
                  </p>
                  {errors.age && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.age}</p>
                  )}
                </div>

                {/* Pole 3: Numer telefonu z prefiksem PL +48 */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-foreground mb-1.5"
                  >
                    Numer telefonu <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-border bg-muted/40 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-background">
                    <div className="flex items-center gap-1 px-3 py-2.5 bg-muted/80 border-r border-border text-xs font-bold text-foreground shrink-0 select-none">
                      <span className="text-sm">🇵🇱</span>
                      <span>+48</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      placeholder="Wprowadź nr telefonu"
                      className="w-full px-3.5 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>
                  )}
                </div>

                {/* Pole 4: E-mail */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-foreground mb-1.5"
                  >
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="Wprowadź e-mail"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-background ${
                        errors.email ? "border-red-500 focus:ring-red-500" : "border-border"
                      }`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Pole 5: Numer PKK (Opcjonalnie) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="pkkNumber"
                      className="text-xs font-semibold text-foreground"
                    >
                      Numer PKK <span className="text-muted-foreground font-normal">(Opcjonalnie)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsPkkModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <HelpCircle className="size-3.5" />
                      Jak wyrobić PKK?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="pkkNumber"
                      type="text"
                      value={pkkNumber}
                      onChange={handlePkkChange}
                      placeholder="np. 12345 67890 12345 67890"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-sm font-mono text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-background"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                    Możesz dostarczyć numer PKK w trakcie trwania części teoretycznej.
                  </p>
                  {errors.pkkNumber && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.pkkNumber}</p>
                  )}
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────── */}
              {/* KOLUMNA 2: WYBÓR KATEGORII I PORA DNIA NA JAZDY            */}
              {/* ──────────────────────────────────────────────────────── */}
              <div className="space-y-6">
                {/* Krok 1A: Wybierz kategorię */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                    <div className="flex items-center gap-2">
                      <Car className="size-5 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-base sm:text-lg font-bold text-foreground">
                        Wybierz kategorię:
                      </h2>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-muted text-muted-foreground border border-border">
                      KROK 1A
                    </span>
                  </div>

                  {/* Lista kategorii w formie interaktywnych kart */}
                  <div className="space-y-2.5" role="radiogroup" aria-label="Wybór kategorii prawa jazdy">
                    {data.categories.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id;
                      return (
                        <div
                          key={cat.id}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => setSelectedCategoryId(cat.id)}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              setSelectedCategoryId(cat.id);
                            }
                          }}
                          className={`relative flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border-transparent"
                              : "bg-muted/40 hover:bg-muted/80 text-foreground border border-border/70"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex items-center justify-center size-10 rounded-xl transition-colors ${
                                isSelected ? "bg-white/20 text-white" : "bg-card text-blue-600 border border-border/60"
                              }`}
                            >
                              {renderCategoryIcon(cat.icon, isSelected)}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold leading-tight">
                                {cat.title}
                              </div>
                              <div
                                className={`text-[11px] mt-0.5 ${
                                  isSelected ? "text-blue-100" : "text-muted-foreground"
                                }`}
                              >
                                {cat.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <div className="text-right">
                              <span
                                className={`text-sm sm:text-base font-black ${
                                  isSelected ? "text-white" : "text-foreground"
                                }`}
                              >
                                {cat.priceFormatted}
                              </span>
                            </div>
                            <div
                              className={`flex items-center justify-center size-5 rounded-full border transition-all ${
                                isSelected
                                  ? "border-white bg-white text-blue-600"
                                  : "border-muted-foreground/40 bg-transparent"
                              }`}
                            >
                              {isSelected && <div className="size-2 rounded-full bg-blue-600" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Wybierz porę dnia na jazdy */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4.5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">
                        Wybierz porę dnia na jazdy:
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-muted text-muted-foreground border border-border">
                      ELASTYCZNY GRAFIK
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Preferowana pora dnia na jazdy">
                    {data.timePreferences.map((time) => {
                      const isSelected = selectedTimeSlotId === time.id;
                      return (
                        <button
                          key={time.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedTimeSlotId(time.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all duration-200 border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            isSelected
                              ? "bg-blue-800 text-white border-blue-700 shadow-sm shadow-blue-900/30"
                              : "bg-muted/40 hover:bg-muted/70 text-foreground border-border"
                          }`}
                        >
                          <div className="mb-1">{renderTimeIcon(time.icon, isSelected)}</div>
                          <span className="text-xs font-bold">{time.title}</span>
                          <span
                            className={`text-[10px] mt-0.5 ${
                              isSelected ? "text-blue-200" : "text-muted-foreground"
                            }`}
                          >
                            {time.hours}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Baner: Dostęp do platformy e-learningowej (W CENIE) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-9 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
                      <Monitor className="size-4.5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold">
                        {data.learningAccess.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {data.learningAccess.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 shrink-0">
                    {data.learningAccess.badge}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* PRAWA KOLUMNA: PODSUMOWANIE, KOORDYNATOR ORAZ FLOTA           */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-6">
            {/* KARTA 1: GŁÓWNE PODSUMOWANIE REZERWACJI (CIEMNONIEBIESKA) */}
            <div className="rounded-3xl p-6 sm:p-7 bg-linear-to-b from-blue-700 to-blue-900 text-white shadow-xl shadow-blue-950/20 border border-blue-500/30">
              {/* Górny wiersz: Badge gwarancji i wolne miejsca */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/20 text-white border border-white/20">
                  {data.summary.availabilityBadge}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  {data.summary.spotsLeft}
                </span>
              </div>

              {/* Cena i wybrana kategoria */}
              <div className="mb-5">
                <div className="text-xs text-blue-200 mb-1">{data.summary.costLabel}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    {selectedCategory.priceFormatted.replace(" zł", "")}
                  </span>
                  <span className="text-xl font-bold text-blue-200">PLN</span>
                </div>
                <div className="text-xs font-medium text-blue-200 mt-1">
                  {selectedCategory.hoursSummary}
                </div>
              </div>

              {/* Lista korzyści */}
              <ul className="space-y-2.5 mb-6 text-xs text-blue-100">
                {data.summary.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-300 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Przycisk CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? "Przetwarzanie..." : data.summary.ctaText}</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Informacja o braku opłat */}
              <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-blue-200/90 text-center">
                <Lock className="size-3.5 shrink-0" />
                <span>{data.summary.note}</span>
              </div>
            </div>

            {/* KARTA 2: KOORDYNATOR ZAPISÓW */}
            <div className="rounded-3xl p-5 bg-card border border-border/80 shadow-xs">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="relative size-12 rounded-full overflow-hidden border-2 border-blue-600 shrink-0">
                  <Image
                    src={data.coordinator.image}
                    alt={data.coordinator.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                  <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {data.coordinator.name}
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    {data.coordinator.role} •{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {data.coordinator.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cytat */}
              <blockquote className="p-3 rounded-xl bg-muted/50 border border-border/60 text-xs text-muted-foreground leading-relaxed italic mb-3">
                &ldquo;{data.coordinator.quote}&rdquo;
              </blockquote>

              {/* Przycisk telefonu */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                <a
                  href={`tel:${data.coordinator.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Phone className="size-3.5" />
                  <span>{data.coordinator.phone}</span>
                </a>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {data.coordinator.hours}
                </span>
              </div>
            </div>

            {/* KARTA 3: FLOTA WORD */}
            <div className="rounded-3xl p-4 bg-card border border-border/80 shadow-xs flex items-center gap-4">
              <div className="relative size-20 rounded-2xl overflow-hidden shrink-0 border border-border">
                <Image
                  src={data.fleet.image}
                  alt={data.fleet.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 mb-1">
                  {data.fleet.badge}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                  {data.fleet.title}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                  {data.fleet.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modale pomocnicze */}
      <PkkInfoModal
        isOpen={isPkkModalOpen}
        onClose={() => setIsPkkModalOpen(false)}
      />

      <ApplicationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        data={submittedData}
      />
    </>
  );
}
