"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, ChevronDown, Trash2, X } from "lucide-react";
import type { Order } from "@/types";

type OrderStatus = Order["status"];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "completed", "cancelled"];

const CATEGORIES = [
  "Rice", "Flour", "Oil", "Sugar", "Salt", "Spices", "Lentils",
  "Noodles", "Snacks", "Beverages", "Dairy", "Cleaning", "Personal Care",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | OrderStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (tab !== "all") params.set("status", tab);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (categoryFilter) params.set("category", categoryFilter);

      const res = await api.get(`/orders?${params.toString()}`);
      setOrders(res.data.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [tab, startDate, endDate, categoryFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdating(id);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success("Status updated");
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/orders/${id}`);
      toast.success("Order deleted");
      setDeleteId(null);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategoryFilter("");
    setTab("all");
  };

  const hasActiveFilters = startDate || endDate || categoryFilter || tab !== "all";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* ── Status Tabs ── */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {(["all", ...ALL_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors capitalize ${
              tab === s ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <X size={13} /> Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={28} />
        </div>
      ) : (
        <div className="space-y-3">
          {orders.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
              No orders found
            </div>
          )}
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Order header */}
              <div
                className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === o._id ? null : o._id)}
              >
                <div className="font-mono text-sm font-bold text-indigo-600 min-w-[110px]">
                  {o.orderId}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{o.customerName}</p>
                  <p className="text-xs text-gray-500">{o.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">৳{o.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[o.status]}`}
                >
                  {o.status}
                </span>

                {/* Status changer */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={o.status}
                    disabled={updating === o._id}
                    onChange={(e) => updateStatus(o._id, e.target.value as OrderStatus)}
                    className="appearance-none border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 bg-white cursor-pointer"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                  />
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(o._id); }}
                  className="p-1.5 rounded-md bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                  title="Delete order"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Expanded items */}
              {expanded === o._id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid sm:grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Address</p>
                      <p className="text-gray-700">{o.address}</p>
                    </div>
                    {o.note && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Note</p>
                        <p className="text-gray-700">{o.note}</p>
                      </div>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                          <th className="pb-2">Item</th>
                          <th className="pb-2">Variant</th>
                          <th className="pb-2">Qty</th>
                          <th className="pb-2 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {o.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 font-medium text-gray-800">{item.title}</td>
                            <td className="py-1.5 text-gray-500">{item.variant}</td>
                            <td className="py-1.5 text-gray-700">×{item.quantity}</td>
                            <td className="py-1.5 text-right text-gray-900">
                              ৳{(item.price * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-bold text-gray-900 border-t border-gray-200">
                          <td colSpan={3} className="pt-2">Total</td>
                          <td className="pt-2 text-right">৳{o.totalAmount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete Order?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete the order. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
