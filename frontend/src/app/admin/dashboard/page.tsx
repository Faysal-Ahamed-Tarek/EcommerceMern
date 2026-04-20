"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShoppingBag, Package, Star, TrendingUp } from "lucide-react";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  pendingReviews: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data.data)).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? "—", icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? "—", icon: TrendingUp, color: "bg-orange-500" },
    { label: "Total Products", value: stats?.totalProducts ?? "—", icon: Package, color: "bg-green-500" },
    { label: "Pending Reviews", value: stats?.pendingReviews ?? "—", icon: Star, color: "bg-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
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
    </div>
  );
}
