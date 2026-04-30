"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import SafeImage from "@/components/ui/SafeImage";
import type { Category } from "@/types";

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.data ?? [])).catch(() => {});
  }, []);

  const syncArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  // Re-check arrows after categories load and on resize
  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows, { passive: true });
    return () => window.removeEventListener("resize", syncArrows);
  }, [categories, syncArrows]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 240 : -240, behavior: "smooth" });
    setTimeout(syncArrows, 350);
  };

  if (!categories.length) return null;

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="block w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Shop by Category</h2>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={syncArrows}
        className="flex gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-2 mb-4"
      >
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/category/${cat.slug}`}
            className="group shrink-0 flex flex-col items-center gap-2 w-24 sm:w-28"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-green-50 border-2 border-transparent group-hover:border-green-500 transition-all shadow-sm flex items-center justify-center">
              {cat.image ? (
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-3xl">🛍️</span>
              )}
            </div>
            <span className="text-xs font-semibold text-gray-700 text-center group-hover:text-green-700 transition-colors leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={() => scroll("left")}
          disabled={!canLeft}
          aria-label="Scroll left"
          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => scroll("right")}
          disabled={!canRight}
          aria-label="Scroll right"
          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
