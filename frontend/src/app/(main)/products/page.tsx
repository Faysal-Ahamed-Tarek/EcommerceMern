"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { useDebounce } from "@/hooks/useDebounce";
import type { Product, Category, ApiResponse } from "@/types";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function ProductsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [search, setSearch] = useState(sp.get("search") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [sort, setSort] = useState("latest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const debouncedSearch = useDebounce(search, 400);
  const LIMIT = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data ?? []);
      setTotal(res.data.pagination?.total ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, sort, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.data ?? [])).catch(() => {});
  }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedSearch, category, sort, minPrice, maxPrice]);

  const totalPages = Math.ceil(total / LIMIT);
  const hasActiveFilter = !!(category || minPrice || maxPrice || debouncedSearch);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("latest");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-medium">All Products</span>
      </nav>

      <div className="flex items-start gap-6">
        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden lg:block w-56 shrink-0 space-y-5">
          <FilterPanel
            categories={categories}
            category={category}
            setCategory={setCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            hasActiveFilter={hasActiveFilter}
            clearFilters={clearFilters}
          />
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Search */}
            <div className="flex-1 relative min-w-[180px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2.5 text-sm outline-none bg-white font-medium transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Mobile filter btn */}
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="lg:hidden flex items-center gap-1.5 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-green-400 transition-colors"
            >
              <SlidersHorizontal size={15} />
              Filter {hasActiveFilter && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
            </button>
          </div>

          {/* Mobile filter drawer */}
          {showFilter && (
            <div className="lg:hidden bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
              <FilterPanel
                categories={categories}
                category={category}
                setCategory={setCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                hasActiveFilter={hasActiveFilter}
                clearFilters={clearFilters}
              />
            </div>
          )}

          {/* Result count */}
          <p className="text-sm text-gray-500 mb-4 font-medium">
            {loading ? "Loading…" : `${total} product${total !== 1 ? "s" : ""} found`}
          </p>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-gray-700 font-semibold text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
              {hasActiveFilter && (
                <button onClick={clearFilters} className="mt-4 text-green-600 font-medium text-sm hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:border-green-400 transition-colors"
              >
                ← Prev
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                        p === page ? "bg-green-600 text-white" : "border-2 border-gray-200 hover:border-green-400 text-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:border-green-400 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Filter panel component ── */
function FilterPanel({
  categories, category, setCategory,
  minPrice, setMinPrice, maxPrice, setMaxPrice,
  hasActiveFilter, clearFilters,
}: {
  categories: Category[];
  category: string; setCategory: (v: string) => void;
  minPrice: string; setMinPrice: (v: string) => void;
  maxPrice: string; setMaxPrice: (v: string) => void;
  hasActiveFilter: boolean; clearFilters: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
        {hasActiveFilter && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</p>
        <div className="space-y-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="cat"
              value=""
              checked={!category}
              onChange={() => setCategory("")}
              className="accent-green-600"
            />
            <span className="text-sm text-gray-700 group-hover:text-green-700">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="cat"
                value={cat.slug}
                checked={category === cat.slug}
                onChange={() => setCategory(cat.slug)}
                className="accent-green-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-green-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Range (৳)</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
