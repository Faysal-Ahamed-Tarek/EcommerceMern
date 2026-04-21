"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ShoppingBag, Package, Star, TrendingUp, Loader2 } from "lucide-react";
import type { Order } from "@/types";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  pendingReviews: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data.data)).catch(() => {});
    api.get("/orders?limit=10")
      .then((res) => setRecentOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, []);

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? "—", icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? "—", icon: TrendingUp, color: "bg-orange-500" },
    { label: "Total Products", value: stats?.totalProducts ?? "—", icon: Package, color: "bg-green-500" },
    { label: "Pending Reviews", value: stats?.pendingReviews ?? "—", icon: Star, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`${color} text-white p-3 rounded-lg`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
            View all →
          </Link>
        </div>
        {loadingOrders ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-300" size={24} /></div>
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
                    <td className="px-5 py-3 font-mono text-xs font-bold text-indigo-600">{o.orderId}</td>
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
