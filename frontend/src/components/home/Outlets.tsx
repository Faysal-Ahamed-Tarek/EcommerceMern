"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";

/**
 * Professional "Outlets" slider section displaying showroom locations in Bangladesh.
 *
 * Import this component in frontend/src/components/home/HomeLazySections.tsx
 * Usage example:
 * const Outlets = dynamic(() => import("@/components/home/Outlets"), { ssr: false });
 */

const outlets = [
  {
    title: "শোরুম ১:",
    address: "১৯.১৯/৫৫, ওয়ার্ড-৭, এপেক্স শোরুমের বিপরীতে, রূপনগর\nমিরপুর-২",
    phone: "01334930485",
  },
  {
    title: "শোরুম ২:",
    address: "১৯২-১৯৩, গ্রীন রোড, ধানমন্ডি\nঢাকা-১২০৫",
    phone: "01334930483",
  },
  {
    title: "শোরুম ৩:",
    address: "বাড়ি নং: বি/২৭, রাস্তা নং:\nজাকির হোসেন রোড, ব্লক: ই, মোহাম্মদপুর, ঢাকা-১২০৭।",
    phone: "01334930484",
  },
  {
    title: "শোরুম ৪:",
    address: "বাড়ি নং: ১৬, রোড নং: ০২,\nসেক্টর নং: ০৩, উত্তরা-১২৩০",
    phone: "01334930482",
  },
  {
    title: "শোরুম 5:",
    address: "বাড়ি নং: ১৩, রোড নং: ০৭, শেখেরটেক, আদাবর-১২০৭",
    phone: "01334930481",
  },
];

export default function Outlets() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const syncArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows, { passive: true });
    return () => window.removeEventListener("resize", syncArrows);
  }, [syncArrows]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth;
    el.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
    setTimeout(syncArrows, 400);
  };

  return (
    <section
      className="max-w-[1200px] mx-auto"
      style={{ fontFamily: "var(--site-font)" }}
      aria-labelledby="outlets-heading"
    >
      <div className="flex items-center gap-3 mb-6">
        <span
          className="block w-1 h-6 rounded-full"
          style={{ backgroundColor: "var(--site-accent)" }}
        />
        <h2 id="outlets-heading" className="text-xl sm:text-2xl font-bold text-gray-900">
          Our Outlets
        </h2>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          onScroll={syncArrows}
          role="region"
          aria-label="Outlets carousel"
          className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4
            [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {outlets.map((outlet, index) => (
            <div
              key={index}
              className="snap-start shrink-0 w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
            >
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-800">
                  {outlet.title}
                </h3>
                <address className="not-italic text-gray-600 mb-5 leading-relaxed whitespace-pre-line text-xs sm:text-sm flex-grow">
                  {outlet.address}
                </address>
                <a
                  href={`tel:${outlet.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all hover:bg-gray-50 active:scale-[0.98] w-full text-xs sm:text-sm border"
                  style={{
                    borderColor: "var(--site-accent)",
                    color: "var(--site-accent)",
                  }}
                >
                  <Phone size={14} className="shrink-0" />
                  <span>{outlet.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
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
      </div>
    </section>
  );
}
