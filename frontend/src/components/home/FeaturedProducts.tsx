"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface Props {
  products: Product[];
}

export default function FeaturedProducts({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const step = container.clientWidth >= 1024 ? container.clientWidth / 4 : 280;
    container.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="block w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Featured Products</h2>
        </div>
        <Link
          href="/products"
          className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          onClick={() => scroll("left")}
          className="cursor-pointer h-10 w-10 sm:h-11 sm:w-11 inline-flex items-center justify-center rounded-md border border-gray-300 hover:border-green-500 hover:text-green-600 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="cursor-pointer h-10 w-10 sm:h-11 sm:w-11 inline-flex items-center justify-center rounded-md border border-gray-300 hover:border-green-500 hover:text-green-600 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}