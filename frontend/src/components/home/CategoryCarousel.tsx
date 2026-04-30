"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface Props {
  categoryName: string;
  categorySlug: string;
  products: Product[];
}

export default function CategoryCarousel({ categoryName, categorySlug, products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const syncArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows, { passive: true });
    return () => window.removeEventListener("resize", syncArrows);
  }, [products, syncArrows]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth >= 1024 ? el.clientWidth / 4 : 280;
    el.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
    setTimeout(syncArrows, 350);
  };

  if (!products.length) return null;

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="block w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{categoryName}</h2>
        </div>
        <Link
          href={`/category/${categorySlug}`}
          className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
        >
          View All →
        </Link>
      </div>

      <div
        ref={scrollRef}
        onScroll={syncArrows}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mb-4"
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="snap-start shrink-0 w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-3rem)/4)]"
          >
            <ProductCard product={product} />
          </div>
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
