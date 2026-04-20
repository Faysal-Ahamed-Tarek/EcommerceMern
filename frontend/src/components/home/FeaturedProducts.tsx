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
    scrollRef.current?.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="block w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Featured Products</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="cursor-pointer p-1.5 rounded-full border border-gray-200 hover:border-green-500 hover:text-green-600 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="cursor-pointer p-1.5 rounded-full border border-gray-200 hover:border-green-500 hover:text-green-600 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
          <Link
            href="/products"
            className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors ml-1"
          >
            View all →
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="snap-start shrink-0 w-[47vw] sm:w-52 lg:w-60"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
