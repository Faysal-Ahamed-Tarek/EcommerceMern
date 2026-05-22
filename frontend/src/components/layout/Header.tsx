"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Menu, X, Search, Store, Phone,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSiteData } from "@/context/SiteDataContext";

export default function Header() {
  const router = useRouter();
  const { categories, config } = useSiteData();
  const marqueeEnabled = config.marqueeEnabled;
  const marqueeTexts = config.marqueeTexts;
  const headerLogo = config.headerLogo ?? "";
  const headerPhone = config.headerPhone;
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* ── Top bar ── */}
      {marqueeEnabled && (
        <div className="bg-green-700 text-white text-xs py-2">
          <div className="max-w-[1200px] mx-auto px-2 flex items-center justify-center gap-0 md:gap-6 flex-wrap">
            {marqueeTexts.map((text, i) => (
              <span key={i} className=" font-medium tracking-wide">{text}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Main header ── */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        {/* Row 1 */}
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-3 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            {headerLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={headerLogo} alt="Store logo" className="w-32 md:w-32 h-auto object-contain" />
            ) : (
              <div className="bg-green-600 text-white font-extrabold text-lg px-3 py-1.5 rounded-lg leading-none">
                Shop<span className="text-green-200">BD</span>
              </div>
            )}
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 justify-center">
            <div className="flex w-full max-w-sm overflow-hidden border-2 border-gray-300 transition-colors">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands…"
                className="flex-1 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none bg-white"
              />
              <div className="w-px bg-gray-300 my-2" aria-hidden="true" />
              <button
                type="submit"
                className="px-5 text-white flex items-center gap-1.5 font-medium text-sm "
              >
                <Search className="text-gray-600" size={16} />
                {/* <span className="hidden text-gray-500 md:inline">Search</span>   */}
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-1 ml-auto sm:ml-0 shrink-0">
            {/* Phone */}
            {headerPhone && (
              <a
                href={`tel:${headerPhone.replace(/\s/g, "")}`}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors"
              >
                <Phone size={14} /> {headerPhone}
              </a>
            )}

            {/* Shop */}
            <Link
              href="/products"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors"
            >
              <Store size={14} /> Shop
            </Link>

            {/* Cart */}
            <Link
              href="/checkout"
              className="relative flex items-center gap-2 transition-colors px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50"
            >
              <ShoppingCart size={18} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 text-white">
                  {totalItems}
                </span>
              )}
              <span className="hidden sm:inline">Cart</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Row 2 — Category nav (desktop) */}
        {/* <nav className="border-t border-gray-100 hidden sm:block bg-white">
          <ul className="max-w-[1200px] mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
            <li className="shrink-0">
              <Link
                href="/products"
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Menu size={14} /> All Products
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat._id} className="shrink-0">
                <Link
                  href={`/category/${cat.slug}`}
                  className="block px-3 py-1.5 text-sm text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors whitespace-nowrap font-medium"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav> */}

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 rounded-xl"
              >
                <Search size={16} />
              </button>
            </form>

            {/* Mobile categories */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile phone */}
            {headerPhone && (
              <a
                href={`tel:${headerPhone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 px-3 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold"
              >
                <Phone size={15} /> {headerPhone}
              </a>
            )}

          </div>
        )}
      </header>
    </>
  );
}
