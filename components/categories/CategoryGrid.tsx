"use client";

import { useState } from "react";
import { CategoryFilter, CourseCategory, FilterId, filterCategories } from "@/lib/categories";
import CategoryCard from "./CategoryCard";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryGridProps {
  categories: CourseCategory[];
  filters: CategoryFilter[];
}

export default function CategoryGrid({ categories, filters }: CategoryGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const visible = filterCategories(categories, activeFilter);

  return (
    <div>
      {/* Filtry */}
      <div
        role="tablist"
        aria-label="Filtruj kategorie kursów"
        className="flex flex-wrap justify-center gap-2 mb-10"
      >
        {filters.map((filter) => {
          const isActive = filter.id === activeFilter;
          return (
            <button
              key={filter.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveFilter(filter.id as FilterId)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                isActive
                  ? "bg-foreground text-background border-foreground shadow-md"
                  : "bg-background text-muted-foreground border-border hover:border-blue-300 hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Siatka kart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {visible.map((category) => (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
