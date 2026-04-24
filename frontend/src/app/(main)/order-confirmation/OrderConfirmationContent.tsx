"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2, Printer, ShoppingBag, Home } from "lucide-react";
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

export default function OrderConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const autoPrint = params.get("print") === "1";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    api
      .get(`/orders/confirmation/${orderId}`)
      .then((res) => setOrder(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (autoPrint && order) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [autoPrint, order]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-10 max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">✅</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Order Placed!</h1>
            <p className="text-gray-500 text-sm mt-1">Thank you for your purchase.</p>
          </div>
          {orderId && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
              <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">Order ID</p>
              <p className="text-xl font-extrabold text-green-800">{orderId}</p>
            </div>
          )}
          <div className="flex flex-col gap-2.5 pt-2">
            <Link href="/products" className="block bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl text-sm">
              Continue Shopping
            </Link>
            <Link href="/" className="block border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3.5 rounded-2xl text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = order.deliveryCharge ?? 0;
  const serial = order.orderId.replace("ORD-", "");

  return (
    <>
      {/* ── Print styles injected globally ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #receipt-print, #receipt-print * { visibility: visible !important; }
          #receipt-print { position: fixed; inset: 0; width: 100%; padding: 20px; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ── Screen: success banner ── */}
      <div className="no-print bg-green-50 border-b border-green-100 py-4 px-4 text-center">
        <p className="text-green-800 font-semibold text-sm">
          ✅ Order placed successfully! Your order ID is <strong>{order.orderId}</strong>
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-16">
        {/* ── Action buttons (screen only) ── */}
        <div className="no-print flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <Home size={15} /> Home
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors"
            >
              <Printer size={15} /> Download / Print Receipt
            </button>
            <Link
              href="/products"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
            >
              <ShoppingBag size={15} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Receipt card ── */}
        <div
          id="receipt-print"
          ref={printRef}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
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
              <p className="text-xs text-gray-400 mb-0.5">Serial</p>
              <p className="font-bold text-gray-900">#{serial}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Order Type</p>
              <p className="font-bold text-gray-900">Online</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date</p>
              <p className="font-bold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
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

          {/* Order summary totals */}
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
                <span>Payment Method</span>
                <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-center text-xs text-gray-400">
            Thank you for your order! We'll call you to confirm delivery.
          </div>
        </div>

        {/* ── Screen: info cards ── */}
        <div className="no-print mt-6 bg-green-50 border border-green-100 rounded-2xl px-5 py-4 text-sm text-green-800 space-y-1.5">
          <p className="flex items-center gap-2">📞 We'll call to confirm delivery</p>
          <p className="flex items-center gap-2">💵 Pay cash when your order arrives</p>
          <p className="flex items-center gap-2">🚚 Delivery within 3–5 working days</p>
        </div>
      </div>
    </>
  );
}
