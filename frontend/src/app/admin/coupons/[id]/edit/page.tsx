"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import CouponForm, { EMPTY_FORM, type CouponFormValues } from "../../_components/CouponForm";

export default function EditCouponPage() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<CouponFormValues | null>(null);

  useEffect(() => {
    api.get("/coupons").then(({ data }) => {
      const coupon = data.data.find((c: any) => c._id === id);
      if (!coupon) return;
      setInitial({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: String(coupon.discountValue),
        maxUsageCount: coupon.maxUsageCount != null ? String(coupon.maxUsageCount) : "",
        minOrderAmount: coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : "",
        expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : "",
        isActive: coupon.isActive,
        description: coupon.description ?? "",
      });
    });
  }, [id]);

  if (!initial) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return <CouponForm title="Edit Coupon" initial={initial} couponId={id} />;
}
