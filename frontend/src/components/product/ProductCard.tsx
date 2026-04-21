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

  const hasVariants = product.variants && product.variants.length > 0;

  // For variant products: find the minimum effective price across all options
  const displayPrice = hasVariants
    ? Math.min(
        ...product.variants!.map((v) => (v.discountPrice > 0 ? v.discountPrice : v.price))
      )
    : product.DiscountPrice > 0
    ? product.DiscountPrice
    : product.basePrice;

  const hasDiscount = hasVariants
    ? false // variant products show "From" price, not a discount badge
    : product.DiscountPrice > 0 && product.DiscountPrice < product.basePrice;

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
      variant: "Default",
      price: displayPrice,
      quantity: 1,
    });
    toast.success(`"${product.title}" added to cart`);
  };

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">

      {/* Image block */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden bg-gray-50"
        style={{ aspectRatio: "1 / 1" }}
      >
        <SafeImage
          src={image}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full leading-none">
            -{discountPct}%
          </span>
        )}
      </Link>

      {/* Info block */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Title */}
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h2 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-green-700 transition-colors">
            {product.title}
          </h2>
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-green-700">
            {hasVariants ? "From " : ""}৳{displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              ৳{product.basePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* CTA */}
        {hasVariants ? (
          <Link
            href={`/products/${product.slug}`}
            className="mt-auto w-full flex items-center justify-center gap-1.5 border border-green-600 text-green-700 text-xs font-semibold py-2 rounded-xl hover:bg-green-600 hover:text-white transition-colors duration-200"
          >
            See Options
          </Link>
        ) : (
          <button
            onClick={handleAddToCart}
            className="cursor-pointer mt-auto w-full flex items-center justify-center gap-1.5 border border-green-600 text-green-700 text-xs font-semibold py-2 rounded-xl hover:bg-green-600 hover:text-white transition-colors duration-200"
          >
            <ShoppingCart size={13} />
            Add to Cart
          </button>
        )}
      </div>
    </article>
  );
}
