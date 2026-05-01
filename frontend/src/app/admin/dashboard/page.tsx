"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  ShoppingBag, Package, AlertTriangle, TrendingUp,
  CalendarCheck, Loader2,
} from "lucide-react";
import type { Order } from "@/types";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  ordersToday: number;
  totalProducts: number;
  pendingReviews: number;
  activeProducts: number;
}

interface LowStockProduct {
  _id: string;
  title: string;
  totalStock: number;
  slug: string;
  images: { cloudinaryUrl: string }[];
}

interface TopSellingItem {
  _id: string;
  title: string;
  image?: string;
  totalQty: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const RANK_STYLES = [
  { bar: "bg-yellow-400", text: "text-yellow-600" },
  { bar: "bg-gray-400",   text: "text-gray-500"  },
  { bar: "bg-orange-400", text: "text-orange-500"},
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWidgets, setLoadingWidgets] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error("Failed to load stats"));

    api.get("/orders?limit=10")
      .then((res) => setRecentOrders(res.data.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoadingOrders(false));

    Promise.all([
      api.get("/admin/low-inventory"),
      api.get("/admin/top-selling"),
    ])
      .then(([lowRes, topRes]) => {
        setLowStock(lowRes.data.data);
        setTopSelling(topRes.data.data);
      })
      .catch(() => toast.error("Failed to load widgets"))
      .finally(() => setLoadingWidgets(false));
  }, []);

  const METRIC_CARDS = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? "—",
      icon: ShoppingBag,
      bg: "bg-blue-500",
    },
    {
      label: "Orders Today",
      value: stats?.ordersToday ?? "—",
      icon: CalendarCheck,
      bg: "bg-emerald-500",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? "—",
      icon: TrendingUp,
      bg: "bg-orange-500",
    },
    {
      label: "Total Products",
      value: stats?.totalProducts ?? "—",
      icon: Package,
      bg: "bg-violet-500",
    },
  ];

  const maxQty = topSelling[0]?.totalQty ?? 1;

  return (
    <div className="space-y-7">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_CARDS.map(({ label, value, icon: Icon, bg }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`${bg} text-white p-3 rounded-lg shrink-0`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">{label}</p>
              <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Widgets row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" />
              <h2 className="font-semibold text-gray-800">Low Stock</h2>
              <span className="text-xs text-gray-400">(under 10)</span>
            </div>
            <Link href="/admin/products" className="text-sm text-indigo-600 hover:text-indigo-800">
              Manage →
            </Link>
          </div>
          {loadingWidgets ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-gray-300" size={22} />
            </div>
          ) : lowStock.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">All products well-stocked</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {lowStock.map((p) => (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3">
                  {p.images?.[0]?.cloudinaryUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0].cloudinaryUrl}
                      alt={p.title}
                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0" />
                  )}
                  <p className="flex-1 text-sm font-medium text-gray-800 truncate">{p.title}</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    p.totalStock <= 3 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                  }`}>
                    {p.totalStock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <h2 className="font-semibold text-gray-800">Top Selling Products</h2>
            </div>
            <Link href="/admin/orders" className="text-sm text-indigo-600 hover:text-indigo-800">
              View orders →
            </Link>
          </div>
          {loadingWidgets ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-gray-300" size={22} />
            </div>
          ) : topSelling.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">No sales data yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {topSelling.map((item, idx) => {
                const rank = RANK_STYLES[idx];
                const pct = Math.round((item.totalQty / maxQty) * 100);
                return (
                  <div key={item._id} className="flex items-center gap-3 px-5 py-3.5">
                    {/* Rank */}
                    <span className="text-sm font-bold text-gray-400 w-7 shrink-0 text-center">
                      #{idx + 1}
                    </span>

                    {/* Thumbnail */}
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center">
                        <Package size={16} className="text-gray-300" />
                      </div>
                    )}

                    {/* Name + progress bar */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${rank ? rank.bar : "bg-indigo-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Units sold */}
                    <div className="shrink-0 text-right">
                      <span className={`text-sm font-bold ${rank ? rank.text : "text-indigo-500"}`}>
                        {item.totalQty}
                      </span>
                      <p className="text-[10px] text-gray-400 leading-tight">sold</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <Link href="/admin/orders" className="text-sm text-indigo-600 hover:text-indigo-800">
            View all →
          </Link>
        </div>
        {loadingOrders ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-gray-300" size={24} />
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-50">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="font-mono text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        {o.orderId}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{o.customerName}</td>
                    <td className="px-5 py-3 text-gray-700">৳{o.totalAmount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
