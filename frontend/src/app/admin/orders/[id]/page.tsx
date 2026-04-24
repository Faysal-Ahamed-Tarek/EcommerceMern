"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Loader2,
  ArrowLeft,
  Save,
  FileText,
  Trash2,
  ChevronDown,
} from "lucide-react";
import type { Order } from "@/types";

type OrderStatus = Order["status"];

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "completed", "cancelled"];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    note: "",
    status: "pending" as OrderStatus,
  });

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => {
        const o: Order = res.data.data;
        setOrder(o);
        setForm({
          customerName: o.customerName,
          phone: o.phone,
          address: o.address,
          note: o.note ?? "",
          status: o.status,
        });
      })
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/orders/${id}`, form);
      setOrder(res.data.data);
      toast.success("Order updated");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/orders/${id}`);
      toast.success("Order deleted");
      router.push("/admin/orders");
    } catch {
      toast.error("Failed to delete order");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-32 text-gray-400">
        <p className="text-lg font-medium">Order not found</p>
        <Link href="/admin/orders" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = order.deliveryCharge ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{order.orderId}</h1>
            <p className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleString("en-GB")}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${STATUS_COLORS[order.status]}`}
          >
            {order.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${id}/receipt`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium"
          >
            <FileText size={14} /> Receipt
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: editable order info */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                <input
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Delivery Address
                </label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Note (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  className={`${inputCls} resize-none`}
                  placeholder="No note"
                />
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 w-10"></th>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Variant</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Unit</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-9 h-9 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-gray-100 rounded-md" />
                        )}
                      </td>
                      <td className="py-2.5 font-medium text-gray-800">{item.title}</td>
                      <td className="py-2.5 text-gray-500 text-xs">{item.variant}</td>
                      <td className="py-2.5 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-2.5 text-right text-gray-600">৳{item.price.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={4} />
                    <td className="pt-2.5 text-right text-xs text-gray-500">Subtotal</td>
                    <td className="pt-2.5 text-right font-medium text-gray-700">
                      ৳{subtotal.toLocaleString()}
                    </td>
                  </tr>
                  {delivery > 0 && (
                    <tr>
                      <td colSpan={4} />
                      <td className="pt-1 text-right text-xs text-gray-500">Delivery</td>
                      <td className="pt-1 text-right font-medium text-gray-700">
                        ৳{delivery.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={4} />
                    <td className="pt-2 text-right text-sm font-bold text-gray-900">Total</td>
                    <td className="pt-2 text-right text-base font-bold text-gray-900">
                      ৳{order.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right: status + save */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              Order Status
            </h2>
            <div className="relative">
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OrderStatus }))}
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white pr-8 capitalize font-medium"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-3 pb-3 border-b border-gray-100">
              Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-800 capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium capitalize ${
                    order.paymentStatus === "paid" ? "text-green-600" : "text-orange-500"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-gray-900">৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete Order?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete <strong>{order.orderId}</strong>. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
