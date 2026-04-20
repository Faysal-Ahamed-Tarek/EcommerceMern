import { Suspense } from "react";
import OrderConfirmationContent from "./OrderConfirmationContent";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading…</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
