"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, Tag, ShoppingBag, Star, Palette, LogOut, ChevronDown, ChevronRight, Files } from "lucide-react";

const PAGES_LINKS = [
  { label: "Home",                href: "/admin/pages/home" },
  { label: "Privacy Policy",      href: "/admin/pages/privacy-policy" },
  { label: "About Us",            href: "/admin/pages/about" },
  { label: "Terms & Conditions",  href: "/admin/pages/terms" },
  { label: "Header",              href: "/admin/pages/header" },
  { label: "Footer",              href: "/admin/pages/footer" },
];

const NAV_LINKS = [
  { label: "Dashboard",  href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Products",   href: "/admin/products",   icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Orders",     href: "/admin/orders",     icon: ShoppingBag },
  { label: "Reviews",    href: "/admin/reviews",    icon: Star },
  { label: "Theme",      href: "/admin/theme",      icon: Palette },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const isPagesActive = pathname.startsWith("/admin/pages");
  const [pagesOpen, setPagesOpen] = useState(isPagesActive);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (isLoginPage) {
      if (token) router.replace("/admin/dashboard");
      setChecking(false);
      return;
    }
    if (!token) {
      router.replace("/admin/login");
    } else {
      setAuthed(true);
    }
    setChecking(false);
  }, [isLoginPage, router]);

  useEffect(() => {
    if (isPagesActive) setPagesOpen(true);
  }, [isPagesActive]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAuthed(false);
    router.replace("/admin/login");
  };

  if (checking) return null;
  if (isLoginPage) return <>{children}</>;
  if (!authed) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="px-5 py-5 text-white font-bold text-lg border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === href
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          {/* Pages dropdown */}
          <div>
            <button
              onClick={() => setPagesOpen((v) => !v)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isPagesActive
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Files size={16} />
              <span className="flex-1 text-left">Pages</span>
              {pagesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {pagesOpen && (
              <div className="ml-4 mt-1 space-y-0.5">
                {PAGES_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      pathname === href
                        ? "bg-indigo-500 text-white"
                        : "hover:bg-gray-700 hover:text-white text-gray-400"
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-4 text-sm text-gray-400 hover:text-white border-t border-gray-700 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
