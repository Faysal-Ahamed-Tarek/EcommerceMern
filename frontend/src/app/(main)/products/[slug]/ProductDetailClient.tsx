"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/ui/SafeImage";
import {
  ShoppingCart, Zap, MessageCircle, ChevronRight, ChevronDown,
  Minus, Plus, Star, Loader2, ImagePlus, X, BadgeCheck, PenLine,
} from "lucide-react";
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
const REVIEWS_PER_PAGE = 4;

function sanitize(html: string) {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (months >= 12) return `${Math.floor(months / 12)}yr ago`;
  if (months >= 1) return `${months}mo ago`;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days >= 1) return `${days}d ago`;
  return "Today";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "bg-green-600", "bg-teal-600", "bg-blue-600", "bg-violet-600",
  "bg-rose-600", "bg-amber-600", "bg-cyan-600", "bg-pink-600",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
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
            className={n <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={15}
          className={n <= value ? "fill-green-600 text-green-600" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

function ReviewFormModal({
  productSlug,
  onClose,
  onSuccess,
}: {
  productSlug: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ customerName: "", rating: 5, comment: "", imageUrl: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!form.comment.trim()) e.comment = "Comment is required";
    if (form.comment.trim().length < 5) e.comment = "Comment must be at least 5 characters";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        productSlug,
        customerName: form.customerName,
        rating: form.rating,
        comment: form.comment,
        imageUrl: form.imageUrl || undefined,
      });
      toast.success("Review submitted! It will appear after approval.");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">Write a Review</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.customerName}
              onChange={(e) => { setForm((f) => ({ ...f, customerName: e.target.value })); setErrors((er) => ({ ...er, customerName: "" })); }}
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Rating <span className="text-red-500">*</span>
            </label>
            <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={form.comment}
              onChange={(e) => { setForm((f) => ({ ...f, comment: e.target.value })); setErrors((er) => ({ ...er, comment: "" })); }}
              placeholder="Share your experience with this product…"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
            {errors.comment && <p className="text-xs text-red-500 mt-1">{errors.comment}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Photo (optional)</label>
            {form.imageUrl ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="Review" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
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
                  if (info?.secure_url) setForm((f) => ({ ...f, imageUrl: info.secure_url! }));
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [mainImage, setMainImage] = useState(product.images[0]?.cloudinaryUrl ?? "");
  const [qty, setQty] = useState(1);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const [reviews, setReviews] = useState<Review[]>([]);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get(`/reviews/product/${product.slug}`);
      setReviews(res.data.data ?? []);
    } catch { /* silently ignore */ }
  }, [product.slug]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

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

  const primarySelected = hasVariants ? Object.values(selectedVariants)[0] : null;

  const displayPrice = hasVariants
    ? primarySelected
      ? primarySelected.discountPrice > 0 ? primarySelected.discountPrice : primarySelected.price
      : 0
    : product.DiscountPrice > 0 ? product.DiscountPrice : product.basePrice;

  const baseDisplayPrice = hasVariants ? primarySelected?.price ?? 0 : product.basePrice;

  const hasDiscount = hasVariants
    ? !!primarySelected && primarySelected.discountPrice > 0 && primarySelected.discountPrice < primarySelected.price
    : product.DiscountPrice > 0 && product.DiscountPrice < product.basePrice;

  const discountPct =
    hasDiscount && baseDisplayPrice > 0
      ? Math.round(((baseDisplayPrice - displayPrice) / baseDisplayPrice) * 100)
      : 0;

  const sanitizedDesc = sanitize(product.description);

  const variantLabel = hasVariants
    ? Object.values(selectedVariants).map((v) => v.name).join(" / ")
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

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMoreReviews = reviews.length > visibleCount;

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

        {/* ── Left: Images ── */}
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
                  className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img.cloudinaryUrl
                      ? "border-green-600 shadow-md scale-105"
                      : "border-gray-200 hover:border-gray-400"
                    }`}
                >
                  <SafeImage src={img.cloudinaryUrl} alt="thumb" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details ── */}
        <div className="space-y-5">

          <div>
            <p className="text-xs text-green-600 capitalize font-semibold uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h1 className="text-2xl sm:text-3xl capitalize font-extrabold text-gray-900 leading-tight">
              {product.title}
            </h1>
          </div>

          <div>
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
          </div>

          {product.shortDescription && (
            <p className="text-gray-700 text-sm leading-relaxed py-2">{product.shortDescription}</p>
          )}

          {/* ── Accordion: How to Use / Ingredients ── */}
          {(product.howToUse || product.ingredients) && (
            <div className="overflow-hidden divide-y">
              {product.howToUse && (
                <div className="mb-4 border border-green-100">
                  <button
                    onClick={() => toggleSection("howToUse")}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-800"
                  >
                    How to Use
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${openSections["howToUse"] ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openSections["howToUse"] && (
                    <div
                      className="px-4 py-4 prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: sanitize(product.howToUse) }}
                    />
                  )}
                </div>
              )}
              {product.ingredients && (
                <div className="mb-4 border border-green-100">
                  <button
                    onClick={() => toggleSection("ingredients")}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-800"
                  >
                    Ingredients
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${openSections["ingredients"] ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openSections["ingredients"] && (
                    <div
                      className="px-4 py-4 prose prose-sm max-w-none text-gray-700 font-sans"
                      dangerouslySetInnerHTML={{ __html: sanitize(product.ingredients) }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Variant Selectors ── */}
          {variantGroups.map(([type, options], gi) => (
            <div key={`${type}-${gi}`}>
              <p className="text-sm font-semibold text-gray-800 mb-2 capitalize">{type}:</p>
              <div className="flex flex-wrap gap-2">
                {options.map((v, oi) => {
                  const isSelected = selectedVariants[type]?.name === v.name;
                  const optionPrice = v.discountPrice > 0 ? v.discountPrice : v.price;
                  return (
                    <button
                      key={`${v.name}-${oi}`}
                      onClick={() => selectVariant(type, v)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${isSelected
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
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors">
                <Minus size={16} />
              </button>
              <span className="px-6 py-2.5 font-bold text-gray-900 min-w-[3.5rem] text-center bg-white select-none">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors">
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

          {product.sku && (
            <p className="text-xs text-gray-400 font-mono">SKU: {product.sku}</p>
          )}

          {/* Trust badges */}
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
          <h2 className="text-2xl font-bold text-gray-900">Product Description</h2>
        </div>
        <div
          className="prose prose-md max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-green-600"
          dangerouslySetInnerHTML={{ __html: sanitizedDesc }}
        />
      </div>

      {/* ── Reviews ── */}
      <div className="mt-14">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="block w-1 h-6 bg-green-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
              {reviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">({reviews.length})</span>
              )}
            </h2>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="flex items-center gap-2 border border-green-600 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-50 transition-colors"
          >
            <PenLine size={15} />
            Write a Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">No reviews yet. Be the first to review!</p>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="mt-3 cursor-pointer text-green-600 text-sm font-semibold hover:underline "
            >
              Write a Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleReviews.map((r) => (
              <div key={r._id} className="p-5 sm:p-6 bg-emerald-50/40 rounded-2xl">
                {/* Header: avatar + name + date | rating */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 w-10 h-10 rounded-full ${avatarColor(r.customerName)} flex items-center justify-center text-white font-bold text-sm`}>
                      {getInitials(r.customerName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm capitalize">{r.customerName}</span>
                        {/* <span className="inline-flex items-center gap-1 text-[11px] text-green-700 border border-green-200 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
                          <BadgeCheck size={11} />
                          Authorized
                        </span> */}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="inline-flex items-center justify-center gap-1 text-center text-[11px] text-green-700 border border-green-200 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
                      <BadgeCheck size={11} />
                      Authorized
                    </span>
                    <div className ="flex items-center gap-3">
                      <span className="font-bold text-gray-800 text-sm">{r.rating}.0</span>
                      <StarDisplay value={r.rating} />
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-gray-700 text-sm leading-relaxed">{r.comment}</p>

                {/* Review image */}
                {r.imageUrl && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.imageUrl}
                      alt="Review"
                      onClick={() => setLightboxUrl(r.imageUrl!)}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}
              </div>
            ))}

            {hasMoreReviews && (
              
              <div className="md:col-span-2 px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-center">
                <button
                  onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
                  className="inline-flex items-center gap-1.5 text-green-700 font-semibold text-sm hover:underline"
                >
                  More reviews
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review modal */}
      {reviewModalOpen && (
        <ReviewFormModal
          productSlug={product.slug}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={fetchReviews}
        />
      )}

      {/* Image lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Review full view"
            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
