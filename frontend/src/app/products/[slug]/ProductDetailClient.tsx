"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/ui/SafeImage";
import { ShoppingCart, Zap, MessageCircle, Star, ChevronRight, Minus, Plus } from "lucide-react";
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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] ?? null
  );
  const [mainImage, setMainImage] = useState(product.images[0]?.cloudinaryUrl ?? "");

  const [qty, setQty] = useState(1);

  const displayPrice = selectedVariant?.price ?? product.DiscountPrice ?? product.basePrice;
  const hasDiscount = product.DiscountPrice > 0 && product.DiscountPrice < product.basePrice;
  const discountPct = hasDiscount
    ? Math.round(((product.basePrice - product.DiscountPrice) / product.basePrice) * 100)
    : 0;

  const sanitizedDesc =
    typeof window !== "undefined"
      ? DOMPurify.sanitize(product.description)
      : product.description;

  const handleAddToCart = () => {
    addItem({
      productSlug: product.slug,
      title: product.title,
      image: mainImage,
      variant: selectedVariant?.name ?? "Default",
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
    `Hi, I want to order:\n*${product.title}*\nVariant: ${selectedVariant?.name ?? "Default"}\nQty: ${qty}\nSKU: ${product.sku}`
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
          {/* Main image */}
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

          {/* Thumbnail strip */}
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
          <div>
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Rating */}
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${i < Math.round(product.ratingAverage) ? "text-amber-400" : "text-gray-200"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                <span className="font-semibold">{product.ratingAverage.toFixed(1)}</span>
                {" "}({product.ratingCount} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="bg-green-50 rounded-2xl px-5 py-4 border border-green-100">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-green-700">
                ৳{displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ৳{product.basePrice.toLocaleString()}
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    SAVE ৳{(product.basePrice - displayPrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-green-700 mt-1 font-medium">💵 Payment: Cash on Delivery</p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2.5">
                Select Variant:
                <span className="text-green-600 ml-1">{selectedVariant?.name}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      selectedVariant?.name === v.name
                        ? "bg-green-600 text-white border-green-600 shadow-md"
                        : "border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700 bg-white"
                    }`}
                  >
                    {v.name}
                    <span className="ml-1.5 text-xs opacity-80">৳{v.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2.5">Quantity:</p>
            <div className="flex items-center gap-0 border-2 border-gray-200 rounded-xl w-fit overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
              >
                <Minus size={16} />
              </button>
              <span className="px-5 py-2.5 font-bold text-gray-900 min-w-[3rem] text-center bg-white">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
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

          {/* WhatsApp order */}
          <a
            href={`https://wa.me/8801XXXXXXXXX?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] transition-colors text-white py-3.5 rounded-2xl font-bold text-sm w-full"
          >
            <MessageCircle size={18} />
            Order via WhatsApp
          </a>

          {/* Quick info */}
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

      {/* ── Product Description ── */}
      <div className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Product Description
        </h2>
        <div
          className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-green-600"
          dangerouslySetInnerHTML={{ __html: sanitizedDesc }}
        />
      </div>
    </div>
  );
}
