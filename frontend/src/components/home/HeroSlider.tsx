"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/types";

interface Props {
  slides: HeroSlide[];
}

/* Fallback hero shown when no slides are configured */
const FALLBACK = (
  <div className="relative w-full overflow-hidden rounded-2xl aspect-[16/6] min-h-[220px] bg-gradient-to-br from-green-800 via-green-700 to-green-600 flex items-center">
    <div className="relative z-10 px-8 sm:px-16 max-w-xl">
      <span className="inline-block bg-amber-400 text-gray-900 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
        New Arrivals
      </span>
      <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
        Fresh &amp; Organic<br />Delivered to You
      </h1>
      <p className="text-green-100 text-sm sm:text-base mb-6 max-w-sm">
        100% natural products sourced directly from farms across Bangladesh.
      </p>
      <Link
        href="/products"
        className="inline-block bg-amber-400 hover:bg-amber-500 transition-colors text-gray-900 font-bold px-8 py-3 rounded-xl text-sm"
      >
        Shop Now →
      </Link>
    </div>
    {/* Decorative circles */}
    <div className="absolute right-0 top-0 w-72 h-72 bg-green-500/30 rounded-full -translate-y-1/3 translate-x-1/4" />
    <div className="absolute right-24 bottom-0 w-40 h-40 bg-green-500/20 rounded-full translate-y-1/2" />
  </div>
);

export default function HeroSlider({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [slides.length, paused, next]);

  if (!slides.length) return FALLBACK;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl aspect-[16/6] min-h-[220px] bg-gray-100 group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, idx) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.altText ?? "Banner"}
            fill
            priority={idx === 0}
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

          {slide.ctaLink && (
            <div className="absolute inset-0 flex items-center px-8 sm:px-16">
              {/* <Link
                href={slide.ctaLink}
                className="bg-green-600 hover:bg-green-700 transition-colors text-white font-bold px-8 py-3 rounded-xl text-sm shadow-lg"
              >
                Shop Now →
              </Link> */}
            </div>
          )}
        </div>
      ))}

      {/* Arrow buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "bg-white w-6 h-2.5" : "bg-white/50 w-2.5 h-2.5"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
