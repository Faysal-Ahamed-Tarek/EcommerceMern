import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface Props {
  products: Product[];
}

export default function TopSellingSection({ products }: Props) {
  if (!products.length) return null;

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="block w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Top Selling</h2>
        </div>
        <Link
          href="/products?topSelling=true"
          className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
