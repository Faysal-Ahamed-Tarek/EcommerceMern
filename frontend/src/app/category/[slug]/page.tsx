import ProductCard from "@/components/product/ProductCard";
import type { Product, ApiResponse } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let products: Product[] = [];
  try {
    const res = await fetch(`${API}/products?category=${slug}&limit=24`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json: ApiResponse<Product[]> = await res.json();
      products = json.data ?? [];
    }
  } catch {}

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 capitalize">{slug.replace(/-/g, " ")}</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
