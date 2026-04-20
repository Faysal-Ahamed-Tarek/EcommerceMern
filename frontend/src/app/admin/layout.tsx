"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, Tag, ShoppingBag, Star, FileText, Palette, LogOut } from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard",  href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Products",   href: "/admin/products",   icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Orders",     href: "/admin/orders",     icon: ShoppingBag },
  { label: "Reviews",    href: "/admin/reviews",    icon: Star },
  { label: "Content",    href: "/admin/content",    icon: FileText },
  { label: "Theme",      href: "/admin/theme",      icon: Palette },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (isLoginPage) {
      // If already logged in, skip the login page
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

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAuthed(false);
    router.replace("/admin/login");
  };

  // Blank screen while checking — no flash of wrong content
  if (checking) return null;

  // Login page — no sidebar, no header/footer
  if (isLoginPage) return <>{children}</>;

  // Not authenticated (briefly, before redirect fires)
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
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-4 text-sm text-gray-400 hover:text-white border-t border-gray-700 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main content — scrollable independently */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
