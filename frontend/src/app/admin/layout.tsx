"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Package, Tag, ShoppingBag, Star, Palette, LogOut, ChevronDown, ChevronRight, Files, Globe, Ticket } from "lucide-react";
import { api } from "@/lib/api";

const PAGES_LINKS = [
  { label: "Home",                href: "/admin/pages/home" },
  { label: "Privacy Policy",      href: "/admin/pages/privacy-policy" },
  { label: "About Us",            href: "/admin/pages/about" },
  { label: "Terms & Conditions",  href: "/admin/pages/terms" },
  { label: "Header",              href: "/admin/pages/header" },
  { label: "Footer",              href: "/admin/pages/footer" },
];

interface NavLink {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const isPagesActive = pathname.startsWith("/admin/pages");
  const [pagesOpen, setPagesOpen] = useState(isPagesActive);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [adminName, setAdminName] = useState("Admin Panel");
  const [adminLogo, setAdminLogo] = useState<string | null>(null);

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

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/notifications");
      setPendingOrders(data.data.pendingOrders ?? 0);
      setPendingReviews(data.data.pendingReviews ?? 0);
    } catch {}
  }, []);

  const fetchBranding = useCallback(async () => {
    try {
      const { data } = await api.get("/config");
      setAdminName(data.data?.adminPanelName || "Admin Panel");
      setAdminLogo(data.data?.adminPanelLogo || null);
    } catch {}
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchNotifications();
    fetchBranding();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [authed, fetchNotifications, fetchBranding]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAuthed(false);
    router.replace("/admin/login");
  };

  if (checking) return null;
  if (isLoginPage) return <>{children}</>;
  if (!authed) return null;

  const NAV_LINKS: NavLink[] = [
    { label: "Dashboard",  href: "/admin/dashboard",  icon: LayoutDashboard },
    { label: "Products",   href: "/admin/products",   icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Tag },
    { label: "Orders",     href: "/admin/orders",     icon: ShoppingBag, badge: pendingOrders },
    { label: "Reviews",    href: "/admin/reviews",    icon: Star, badge: pendingReviews },
    { label: "Coupons",    href: "/admin/coupons",    icon: Ticket },
    { label: "Theme",      href: "/admin/theme",      icon: Palette },
    { label: "SEO",        href: "/admin/seo",        icon: Globe },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="px-4 py-4 text-white font-bold text-base border-b border-gray-700 flex items-center gap-2">
          {adminLogo ? (
            <Image src={adminLogo} alt="logo" width={28} height={28} className="rounded object-contain" />
          ) : null}
          <span className="truncate">{adminName}</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV_LINKS.map(({ label, href, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {badge && badge > 0 ? (
                <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
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
