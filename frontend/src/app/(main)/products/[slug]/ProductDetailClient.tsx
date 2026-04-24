"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/ui/SafeImage";
import { ShoppingCart, Zap, MessageCircle, ChevronRight, Minus, Plus } from "lucide-react";
import DOMPurify from "dompurify";
import { useCartStore } from "@/store/cartStore";
import type { Product, ProductVariant } from "@/types";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [mainImage, setMainImage] = useState(product.images[0]?.cloudinaryUrl ?? "");
  const [qty, setQty] = useState(1);

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

  const sanitizedDesc =
    typeof window !== "undefined"
      ? DOMPurify.sanitize(product.description)
      : product.description;

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

        {/* ── Left: Images ── */}
        <div className="space-y-3">
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
      <div className="mt-12 ">
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-xl sm:text-xl font-bold text-gray-900">Product Description</h2>
        </div>
        <div
          className="prose prose-md max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-green-600"
          dangerouslySetInnerHTML={{ __html: sanitizedDesc }}
        />
      </div>
    </div>
  );
}
