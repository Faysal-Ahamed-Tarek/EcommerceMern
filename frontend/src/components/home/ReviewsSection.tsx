"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, BadgeCheck } from "lucide-react";
import type { HomeReview } from "@/types";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-base ${i < rating ? "text-amber-400" : "text-gray-200"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
      >
        <X size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Review image"
        className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default function ReviewsSection({ reviews }: { reviews: HomeReview[] }) {
  const displayReviews = reviews.slice(0, 8);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

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
  }, [displayReviews, syncArrows]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // On desktop show 3, on mobile show 1 — scroll by one card width
    const cardWidth = el.clientWidth >= 1024
      ? (el.scrollWidth - (displayReviews.length - 1) * 16) / displayReviews.length
      : el.clientWidth;
    el.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" });
    setTimeout(syncArrows, 350);
  };

  if (!displayReviews.length) return null;

  return (
    <section className="my-10 -mx-4 px-4 py-0">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Customer Reviews</h2>
        </div>

        {/* Slider — 1 card on mobile, 3 on desktop */}
        <div
          ref={scrollRef}
          onScroll={syncArrows}
          className="flex  gap-4 overflow-x-auto snap-x snap-mandatory pb-2 mb-4
            [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {displayReviews.map((review) => (
            <div
              key={review._id}
              className=" snap-start shrink-0 w-full lg:w-[calc((100%-2rem)/3)] bg-green-50 rounded-2xl border border-green-100 p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Decorative quote */}
              <span className="absolute top-3 right-4 text-5xl text-green-200 font-serif leading-none select-none">
                &ldquo;
              </span>

              <Stars rating={review.rating} />

              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{review.comment}</p>

              {/* Review image — clickable */}
              {review.imageUrl && (
                <button
                  onClick={() => setLightbox(review.imageUrl!)}
                  className="rounded-xl overflow-hidden border border-green-100 w-full aspect-video block cursor-zoom-in"
                  aria-label="View review image"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={review.imageUrl}
                    alt="Review"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              )}

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-3 border-t border-green-100 mt-auto">
                {review.reviewerPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.reviewerPhoto}
                    alt={review.customerName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-green-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm uppercase shrink-0">
                    {review.customerName[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">{review.customerName}</p>
                    {review.isVerified && <BadgeCheck size={15} className="text-green-500 shrink-0" />}
                  </div>
                  {review.isVerified && (
                    <p className="text-[11px] text-green-600 font-medium">Verified Purchase</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows — centered below */}
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            disabled={!canLeft}
            aria-label="Scroll left"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-green-300 text-green-600 hover:bg-green-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canRight}
            aria-label="Scroll right"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-green-300 text-green-600 hover:bg-green-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}
