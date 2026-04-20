"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import SafeImage from "@/components/ui/SafeImage";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const firstVariant = product.variants[0];
  const displayPrice = firstVariant?.price ?? product.DiscountPrice ?? product.basePrice;
  const hasDiscount = product.DiscountPrice > 0 && product.DiscountPrice < product.basePrice;
  const discountPct = hasDiscount
    ? Math.round(((product.basePrice - product.DiscountPrice) / product.basePrice) * 100)
    : 0;
  const image = product.images[0]?.cloudinaryUrl ?? "";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productSlug: product.slug,
      title: product.title,
      image,
      variant: firstVariant?.name ?? "Default",
      price: displayPrice,
      quantity: 1,
    });
    toast.success(`"${product.title}" added to cart`);
  };

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative overflow-hidden bg-gray-50"
        style={{ aspectRatio: "1 / 1" }}
      >
        <SafeImage
          src={image}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-amber-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
              HOT
            </span>
          )}
        </div>

        {/* Hover overlay with quick-add */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs font-semibold py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1.5"
        >
          <ShoppingCart size={14} />
          Add to Cart
        </button>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Rating */}
        {product.ratingCount > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-xs text-gray-500 font-medium">
              {product.ratingAverage.toFixed(1)}
              <span className="text-gray-400 font-normal"> ({product.ratingCount})</span>
            </span>
          </div>
        )}

        <Link href={`/products/${product.slug}`} className="flex-1">
          <h2 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-green-700 transition-colors leading-snug">
            {product.title}
          </h2>
        </Link>

        {/* Price row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-green-700">
              ৳{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                ৳{product.basePrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Mobile add-to-cart (visible on small screens where hover doesn't work) */}
        <button
          onClick={handleAddToCart}
          className="mt-2.5 sm:hidden w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
        >
          <ShoppingCart size={13} /> Add to Cart
        </button>
      </div>
    </article>
  );
}
