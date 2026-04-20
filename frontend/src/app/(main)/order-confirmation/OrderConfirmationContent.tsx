"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-10 max-w-md w-full text-center space-y-5">
        {/* Animated checkmark */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">✅</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Order Placed!</h1>
          <p className="text-gray-500 text-sm mt-1">
            Thank you for your purchase. We'll confirm shortly.
          </p>
        </div>

        {orderId && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
            <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">
              Order ID
            </p>
            <p className="text-xl font-extrabold text-green-800">{orderId}</p>
            <p className="text-xs text-green-600 mt-1">Save this for tracking your order</p>
          </div>
        )}

        <div className="text-sm text-gray-600 bg-gray-50 rounded-2xl px-4 py-3 text-left space-y-1.5">
          <p className="flex items-center gap-2"><span>📞</span> We'll call to confirm delivery</p>
          <p className="flex items-center gap-2"><span>💵</span> Pay cash when you receive</p>
          <p className="flex items-center gap-2"><span>🚚</span> Delivery within 3–5 working days</p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href="/products"
            className="block bg-green-600 hover:bg-green-700 transition-colors text-white font-bold py-3.5 rounded-2xl text-sm"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="block border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3.5 rounded-2xl text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
