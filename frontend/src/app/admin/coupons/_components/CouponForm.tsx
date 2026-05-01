"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft } from "lucide-react";

export interface CouponFormValues {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  maxUsageCount: string;
  minOrderAmount: string;
  expiryDate: string;
  isActive: boolean;
  description: string;
}

export const EMPTY_FORM: CouponFormValues = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  maxUsageCount: "",
  minOrderAmount: "",
  expiryDate: "",
  isActive: true,
  description: "",
};

interface Props {
  title: string;
  initial: CouponFormValues;
  couponId?: string;
}

export default function CouponForm({ title, initial, couponId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CouponFormValues>(initial);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      toast.error("Code and discount value are required");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        isActive: form.isActive,
        description: form.description || undefined,
        maxUsageCount: form.maxUsageCount ? Number(form.maxUsageCount) : undefined,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
      };

      if (couponId) {
        await api.put(`/coupons/${couponId}`, payload);
        toast.success("Coupon updated");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created");
      }
      router.push("/admin/coupons");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      {/* Back link */}
      <Link
        href="/admin/coupons"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Back to Coupons
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        {/* Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Coupon Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="e.g. SUMMER20"
            maxLength={50}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-400"
            required
          />
        </div>

        {/* Discount type + value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Type</label>
            <select
              value={form.discountType}
              onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "percentage" | "fixed" }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (৳)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.discountValue}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
              placeholder={form.discountType === "percentage" ? "20" : "500"}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
              required
            />
          </div>
        </div>

        {/* Max uses + min order */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Uses</label>
            <input
              type="number"
              min="1"
              value={form.maxUsageCount}
              onChange={(e) => setForm((f) => ({ ...f, maxUsageCount: e.target.value }))}
              placeholder="Unlimited"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Order (৳)</label>
            <input
              type="number"
              min="0"
              value={form.minOrderAmount}
              onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
              placeholder="None"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Expiry date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (internal)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional admin notes…"
            rows={2}
            maxLength={500}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none"
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-indigo-600" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : ""}`} />
          </button>
          <span className="text-sm text-gray-700">{form.isActive ? "Active" : "Inactive"}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Link
            href="/admin/coupons"
            className="flex-1 text-center border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {couponId ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}
