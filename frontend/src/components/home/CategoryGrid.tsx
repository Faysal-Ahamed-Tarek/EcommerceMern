"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import SafeImage from "@/components/ui/SafeImage";
import type { Category } from "@/types";

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.data ?? [])).catch(() => {});
  }, []);

  if (!categories.length) return null;

  return (
    <section className="my-10">
      <SectionHeader title="Shop by Category" />
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mt-5">
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
    </section>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="block w-1 h-6 bg-green-600 rounded-full" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">
          View all →
        </Link>
      )}
    </div>
  );
}
