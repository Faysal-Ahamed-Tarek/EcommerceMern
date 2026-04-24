"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/ui/SafeImage";
import { ShoppingCart, Zap, MessageCircle, ChevronRight, Minus, Plus, Star, Loader2, ImagePlus, X } from "lucide-react";
import DOMPurify from "dompurify";
import { useCartStore } from "@/store/cartStore";
import { api } from "@/lib/api";
import { CldUploadWidget } from "next-cloudinary";
import type { Product, ProductVariant, Review } from "@/types";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function sanitize(html: string) {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html);
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={20}
            className={
              n <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [mainImage, setMainImage] = useState(product.images[0]?.cloudinaryUrl ?? "");
  const [qty, setQty] = useState(1);

  // Tabs for How to Use / Ingredients
  const firstTab = product.howToUse ? "howToUse" : product.ingredients ? "ingredients" : null;
  const [activeTab, setActiveTab] = useState<"howToUse" | "ingredients">(firstTab ?? "howToUse");

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({
    customerName: "", rating: 5, comment: "", imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get(`/reviews/product/${product.slug}`);
      setReviews(res.data.data ?? []);
    } catch { /* silently ignore */ }
  }, [product.slug]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ─── Variant grouping ─────────────────────────────────────────────────────
  const variantGroups = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    const map = new Map<string, ProductVariant[]>();
    for (const v of product.variants) {
      if (!map.has(v.type)) map.set(v.type, []);
      map.get(v.type)!.push(v);
    }
    return Array.from(map.entries());
  }, [product.variants]);

  const hasVariants = variantGroups.length > 0;

  // ─── Selected variant state (default to first option of each type) ─────────
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>(() => {
    const defaults: Record<string, ProductVariant> = {};
    for (const [type, options] of variantGroups) {
      defaults[type] = options[0];
    }
    return defaults;
  });

  const selectVariant = (type: string, variant: ProductVariant) => {
    setSelectedVariants((prev) => ({ ...prev, [type]: variant }));
  };

  // ─── Dynamic pricing ───────────────────────────────────────────────────────
  const primarySelected = hasVariants ? Object.values(selectedVariants)[0] : null;

  const displayPrice = hasVariants
    ? primarySelected
      ? primarySelected.discountPrice > 0
        ? primarySelected.discountPrice
        : primarySelected.price
      : 0
    : product.DiscountPrice > 0
    ? product.DiscountPrice
    : product.basePrice;

  const baseDisplayPrice = hasVariants
    ? primarySelected?.price ?? 0
    : product.basePrice;

  const hasDiscount = hasVariants
    ? !!primarySelected &&
      primarySelected.discountPrice > 0 &&
      primarySelected.discountPrice < primarySelected.price
    : product.DiscountPrice > 0 && product.DiscountPrice < product.basePrice;

  const discountPct =
    hasDiscount && baseDisplayPrice > 0
      ? Math.round(((baseDisplayPrice - displayPrice) / baseDisplayPrice) * 100)
      : 0;

  const sanitizedDesc = sanitize(product.description);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.customerName.trim() || !reviewForm.comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        productSlug: product.slug,
        customerName: reviewForm.customerName,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        imageUrl: reviewForm.imageUrl || undefined,
      });
      toast.success("Review submitted! It will appear after approval.");
      setReviewForm({ customerName: "", rating: 5, comment: "", imageUrl: "" });
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Cart ──────────────────────────────────────────────────────────────────
  const variantLabel = hasVariants
    ? Object.values(selectedVariants)
        .map((v) => v.name)
        .join(" / ")
    : "Default";

  const handleAddToCart = () => {
    addItem({
      productSlug: product.slug,
      title: product.title,
      image: mainImage,
      variant: variantLabel,
      price: displayPrice,
      quantity: qty,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const whatsappMsg = encodeURIComponent(
    `Hi, I want to order:\n*${product.title}*${hasVariants ? `\nVariant: ${variantLabel}` : ""}\nQty: ${qty}`
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 pb-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-green-600">Products</Link>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-medium line-clamp-1 max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

        {/* ── Left: Images (sticky on scroll) ── */}
        <div className="space-y-3 lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
            <SafeImage
              src={mainImage}
              alt={product.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{discountPct}% OFF
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img) => (
                <button
                  key={img.publicId}
                  onClick={() => setMainImage(img.cloudinaryUrl)}
                  className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    mainImage === img.cloudinaryUrl
                      ? "border-green-600 shadow-md scale-105"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <SafeImage
                    src={img.cloudinaryUrl}
                    alt="thumb"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details ── */}
        <div className="space-y-5">

          {/* Category + Title */}
          <div>
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Price */}
          <div className="bg-green-50 rounded-2xl px-5 py-4 border border-green-100">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-green-700">
                ৳{displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ৳{baseDisplayPrice.toLocaleString()}
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    SAVE ৳{(baseDisplayPrice - displayPrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-green-700 mt-1 font-medium">💵 Payment: Cash on Delivery</p>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-gray-700 text-sm leading-relaxed py-2">
              {product.shortDescription}
            </p>
          )}

          {/* ── Tabs: How to Use / Ingredients ── */}
          {(product.howToUse || product.ingredients) && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50">
                {product.howToUse && (
                  <button
                    onClick={() => setActiveTab("howToUse")}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      activeTab === "howToUse"
                        ? "bg-white text-green-700 border-b-2 border-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    How to Use
                  </button>
                )}
                {product.ingredients && (
                  <button
                    onClick={() => setActiveTab("ingredients")}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      activeTab === "ingredients"
                        ? "bg-white text-green-700 border-b-2 border-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Ingredients
                  </button>
                )}
              </div>
              <div className="p-4">
                {activeTab === "howToUse" && product.howToUse && (
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: sanitize(product.howToUse) }}
                  />
                )}
                {activeTab === "ingredients" && product.ingredients && (
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: sanitize(product.ingredients) }}
                  />
                )}
              </div>
            </div>
          )}

          {/* ── Variant Selectors ── */}
          {variantGroups.map(([type, options], gi) => (
            <div key={`${type}-${gi}`}>
              <p className="text-sm font-semibold text-gray-800 mb-2 capitalize">
                {type}:
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((v, oi) => {
                  const isSelected = selectedVariants[type]?.name === v.name;
                  const optionPrice = v.discountPrice > 0 ? v.discountPrice : v.price;
                  return (
                    <button
                      key={`${v.name}-${oi}`}
                      onClick={() => selectVariant(type, v)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-green-600 bg-green-50 text-green-800 shadow-sm"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <span>{v.name}</span>
                      <span className={`ml-2 text-xs ${isSelected ? "text-green-700" : "text-gray-500"}`}>
                        ৳{optionPrice.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2.5">Quantity:</p>
            <div className="flex items-center border-2 border-gray-200 rounded-xl w-fit overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="px-6 py-2.5 font-bold text-gray-900 min-w-[3.5rem] text-center bg-white select-none">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 border-2 border-green-600 text-green-700 py-3.5 rounded-2xl font-bold hover:bg-green-50 transition-colors text-sm"
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-2xl font-bold hover:bg-green-700 transition-colors text-sm shadow-lg shadow-green-200"
            >
              <Zap size={18} /> Buy Now
            </button>
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/8801XXXXXXXXX?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] transition-colors text-white py-3.5 rounded-2xl font-bold text-sm w-full"
          >
            <MessageCircle size={18} />
            Order via WhatsApp
          </a>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-gray-400 font-mono">SKU: {product.sku}</p>
          )}

          {/* Quick trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            {[
              { icon: "🚚", label: "Free delivery", sub: "above ৳999" },
              { icon: "✅", label: "Genuine", sub: "quality assured" },
              { icon: "↩️", label: "7-day", sub: "easy return" },
            ].map((b) => (
              <div key={b.label} className="text-center bg-gray-50 rounded-xl py-3 px-2">
                <span className="text-xl">{b.icon}</span>
                <p className="text-xs font-semibold text-gray-800 mt-1">{b.label}</p>
                <p className="text-[10px] text-gray-500">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-xl font-bold text-gray-900">Product Description</h2>
        </div>
        <div
          className="prose prose-md max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-green-600"
          dangerouslySetInnerHTML={{ __html: sanitizedDesc }}
        />
      </div>

      {/* ── Reviews ── */}
      <div className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-xl font-bold text-gray-900">
            Customer Reviews
            {reviews.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">({reviews.length})</span>
            )}
          </h2>
        </div>

        {/* Approved reviews list */}
        {reviews.length > 0 ? (
          <div className="space-y-4 mb-10">
            {reviews.map((r) => (
              <div key={r._id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.customerName}</p>
                    <StarRating value={r.rating} />
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">
                    {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{r.comment}</p>
                {r.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imageUrl}
                    alt="Review"
                    className="mt-3 w-24 h-24 object-cover rounded-xl border border-gray-200"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm mb-8">No reviews yet. Be the first to review!</p>
        )}

        {/* Review submission form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 text-base">Write a Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={reviewForm.customerName}
                  onChange={(e) => setReviewForm((f) => ({ ...f, customerName: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rating <span className="text-red-500">*</span></label>
                <div className="py-1.5">
                  <StarRating
                    value={reviewForm.rating}
                    onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience with this product…"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            </div>

            {/* Image upload (optional) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Photo (optional)
              </label>
              {reviewForm.imageUrl ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={reviewForm.imageUrl}
                    alt="Review"
                    className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, imageUrl: "" }))}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              ) : UPLOAD_PRESET ? (
                <CldUploadWidget
                  uploadPreset={UPLOAD_PRESET}
                  onSuccess={(result: unknown) => {
                    const info = (result as { info?: { secure_url?: string } })?.info;
                    if (info?.secure_url)
                      setReviewForm((f) => ({ ...f, imageUrl: info.secure_url! }));
                  }}
                  options={{ resourceType: "image", multiple: false }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors"
                    >
                      <ImagePlus size={15} /> Upload Photo
                    </button>
                  )}
                </CldUploadWidget>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
