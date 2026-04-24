"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import type { Order } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  completed: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-green-100 text-green-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-600 text-white",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrderReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (order) {
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Order not found</p>
        <Link href="/admin/orders" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = order.deliveryCharge ?? 0;

  return (
    <>
      <style>{`
        @media print {
          aside, .no-print { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; }
          body { background: white !important; }
          #receipt { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* Screen toolbar */}
      <div className="no-print flex items-center justify-between mb-6">
        <Link
          href={`/admin/orders/${id}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={15} /> Back to order
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Printer size={15} /> Print / Save PDF
        </button>
      </div>

      {/* Receipt */}
      <div
        id="receipt"
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl mx-auto"
      >
        {/* Store header */}
        <div className="bg-green-50 border-b border-green-100 px-6 py-5 flex items-start gap-4">
          <div className="w-14 h-14 bg-white rounded-xl border border-green-200 flex items-center justify-center shrink-0">
            <span className="text-2xl">🌿</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Herblife</h1>
            <p className="text-sm text-gray-500 mt-0.5">Natural Health Products</p>
            <p className="text-xs text-gray-400 mt-1">Cash on Delivery · Bangladesh</p>
          </div>
        </div>

        {/* Bill metadata */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Bill ID</p>
            <p className="font-bold text-gray-900">#{order.orderId.replace("ORD-", "")}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
            <p className="font-bold text-gray-900">{order.orderId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Order Type</p>
            <p className="font-bold text-gray-900">Online</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Date</p>
            <p className="font-bold text-gray-900">
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Status</p>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
        </div>

        {/* Customer info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Customer Information
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="font-semibold text-gray-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="font-semibold text-gray-900">{order.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">Delivery Address</p>
              <p className="font-semibold text-gray-900">{order.address}</p>
            </div>
            {order.note && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400">Note</p>
                <p className="font-semibold text-gray-900">{order.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items table */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Item Details
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-2 w-10"></th>
                <th className="pb-2">Product</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Unit Price</th>
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
                        className="w-9 h-9 object-cover rounded-md border border-gray-100"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gray-100 rounded-md" />
                    )}
                  </td>
                  <td className="py-2.5">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    {item.variant && item.variant !== "Default" && (
                      <p className="text-xs text-gray-400">{item.variant}</p>
                    )}
                  </td>
                  <td className="py-2.5 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-2.5 text-right text-gray-600">৳{item.price.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order summary */}
        <div className="px-6 py-4">
          <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Order Summary
          </h2>
          <div className="space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span>{delivery === 0 ? "Free" : `৳${delivery}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-base">
              <span>Total</span>
              <span>৳{order.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Payment</span>
              <span>{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-center text-xs text-gray-400">
          Thank you for your order!
        </div>
      </div>
    </>
  );
}
