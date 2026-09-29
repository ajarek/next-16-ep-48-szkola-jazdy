export type CategoryGroup = "passenger" | "heavy" | "bus";
export type FilterId = "all" | CategoryGroup;
export type VehicleKind = "car" | "truck" | "semi" | "bus";

export interface CourseCategory {
  id: string;
  code: string;
  group: CategoryGroup;
  badge: string;
  badgeVariant: "blue" | "slate";
  ribbon?: string;
  vehicle: VehicleKind;
  image: string;
  imageAlt: string;
  price: number;
  installmentFrom: number;
  theory: string;
  practice: string;
  features: string[];
}

export interface CategoryFilter {
  id: FilterId;
  label: string;
}

/** Filtruje kategorie kursów według wybranej grupy. */
export function filterCategories(
  categories: CourseCategory[],
  filter: FilterId
): CourseCategory[] {
  if (filter === "all") return categories;
  return categories.filter((category) => category.group === filter);
}

/** Miesięczna rata przy ratach 0% (bez odsetek), zaokrąglona do pełnych złotych. */
export function calculateInstallment(price: number, installments: number): number {
  if (installments <= 0) return price;
  return Math.round(price / installments);
}

/** Formatuje kwotę w polskim formacie, np. 3500 -> "3 500". */
export function formatPrice(value: number): string {
  // Ręczne formatowanie zapewnia identyczny wynik na serwerze i w przeglądarce (brak błędów hydratacji)
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
