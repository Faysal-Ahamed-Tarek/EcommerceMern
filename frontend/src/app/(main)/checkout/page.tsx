"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { z } from "zod";
import { ShoppingBag, Trash2, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid BD number (01XXXXXXXXX)"),
  address: z.string().min(10, "Please enter your full delivery address"),
  note: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const DELIVERY_ZONES = [
  { id: "inside", label: "Inside Dhaka", charge: 60 },
  { id: "outside", label: "Outside Dhaka", charge: 120 },
] as const;

type DeliveryZone = typeof DELIVERY_ZONES[number]["id"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart, removeItem, updateQuantity } = useCartStore();
  const [form, setForm] = useState<CheckoutForm>({ customerName: "", phone: "", address: "", note: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);
  const [deliveryError, setDeliveryError] = useState(false);
  const [loading, setLoading] = useState(false);

  const deliveryCharge = DELIVERY_ZONES.find((z) => z.id === deliveryZone)?.charge ?? null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryZone || deliveryCharge === null) {
      setDeliveryError(true);
      return;
    }
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fe: typeof errors = {};
      result.error.issues.forEach((issue) => { fe[issue.path[0] as keyof CheckoutForm] = issue.message; });
      setErrors(fe);
      return;
    }
    setLoading(true);
    try {
      const subtotalVal = totalAmount();
      const res = await api.post("/orders", {
        ...form,
        items: items.map((i) => ({ productSlug: i.productSlug, title: i.title, variant: i.variant, price: i.price, quantity: i.quantity })),
        totalAmount: subtotalVal + deliveryCharge,
        deliveryCharge,
        paymentMethod: "cod",
      });
      clearCart();
      router.push(`/order-confirmation?orderId=${res.data.data.orderId}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Add some products before checking out.</p>
        <Link
          href="/products"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-2xl transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const subtotal = totalAmount();

  const FIELDS: { name: keyof CheckoutForm; label: string; placeholder: string; type?: string; textarea?: boolean }[] = [
    { name: "customerName", label: "Full Name", placeholder: "e.g. Rahim Uddin" },
    { name: "phone", label: "Phone Number", placeholder: "01XXXXXXXXX", type: "tel" },
    { name: "address", label: "Delivery Address", placeholder: "House no, road, area, city…", textarea: true },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-medium">Checkout</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Checkout</h1>

      <div className="flex flex-col gap-5">
        {/* ── Order summary (first) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4">
            Order Summary ({items.length} item{items.length > 1 ? "s" : ""})
          </h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productSlug}-${item.variant}`}
                className="flex gap-3 items-center"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                  <SafeImage src={item.image ?? ""} alt={item.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.variant}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => item.quantity > 1 ? updateQuantity(item.productSlug, item.variant, item.quantity - 1) : removeItem(item.productSlug, item.variant)}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold text-gray-800 w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productSlug, item.variant, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <p className="text-sm font-bold text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                  <button
                    onClick={() => removeItem(item.productSlug, item.variant)}
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600">Delivery</span>
              <span className={deliveryCharge !== null ? "text-green-600" : "text-gray-400"}>
                {deliveryCharge !== null ? `৳${deliveryCharge}` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>
                {deliveryCharge !== null
                  ? `৳${(subtotal + deliveryCharge).toLocaleString()}`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Shipping form (second) ── */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
            Shipping Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map(({ name, label, placeholder, type, textarea }) => (
              <div key={name} className={textarea ? "sm:col-span-2" : ""}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                {textarea ? (
                  <textarea
                    name={name}
                    value={form[name] ?? ""}
                    onChange={handleChange}
                    placeholder={placeholder}
                    rows={3}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none ${
                      errors[name]
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-green-500"
                    }`}
                  />
                ) : (
                  <input
                    type={type ?? "text"}
                    name={name}
                    value={form[name] ?? ""}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                      errors[name]
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-green-500"
                    }`}
                  />
                )}
                {errors[name] && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors[name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Delivery zone */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Delivery Zone <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DELIVERY_ZONES.map((zone) => (
                <label
                  key={zone.id}
                  onClick={() => { setDeliveryZone(zone.id); setDeliveryError(false); }}
                  className={`flex flex-col gap-0.5 border-2 rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                    deliveryZone === zone.id
                      ? "border-green-500 bg-green-50"
                      : deliveryError
                      ? "border-red-300 bg-red-50/40"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryZone"
                      value={zone.id}
                      checked={deliveryZone === zone.id}
                      onChange={() => { setDeliveryZone(zone.id); setDeliveryError(false); }}
                      className="accent-green-600 w-4 h-4"
                    />
                    <span className="text-sm font-bold text-gray-900">{zone.label}</span>
                  </div>
                  <span className="text-xs text-green-700 font-semibold pl-6">৳{zone.charge}</span>
                </label>
              ))}
            </div>
            {deliveryError && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">Please select a delivery zone</p>
            )}
          </div>

          {/* Payment method */}
          <div className="pt-1">
            <p className="text-sm font-semibold text-gray-700 mb-3">Payment Method</p>
            <label className="flex items-center gap-3 border-2 border-green-500 bg-green-50 rounded-xl px-4 py-3 cursor-pointer">
              <input type="radio" checked readOnly className="accent-green-600 w-4 h-4" />
              <div>
                <p className="text-sm font-bold text-gray-900">💵 Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when your order arrives</p>
              </div>
            </label>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-xs text-green-800 font-medium text-center">
            🔒 Your information is safe and secured
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-green-200 text-base"
          >
            {loading
              ? "Placing your order…"
              : deliveryCharge !== null
              ? `Place Order — ৳${(subtotal + deliveryCharge).toLocaleString()}`
              : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
