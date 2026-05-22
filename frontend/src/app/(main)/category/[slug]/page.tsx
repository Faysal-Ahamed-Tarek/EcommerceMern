import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product, ApiResponse } from "@/types";
import { getSiteOrigin } from "@/lib/seo";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as Category[])?.find((c) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
}

async function getProducts(slug: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products?category=${encodeURIComponent(slug)}&limit=48`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<Product[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getSiteDefaults() {
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data ?? {};
  } catch {
    return {};
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [category, siteDefaults] = await Promise.all([getCategory(slug), getSiteDefaults()]);

  const name = category?.name ?? slug.replace(/-/g, " ");
  const siteOrigin = getSiteOrigin(siteDefaults.siteUrl);
  const title = `${name} | DrSkinC`;
  const description = `Shop the best ${name.toLowerCase()} products with fast delivery across Bangladesh.`;
  const canonical = `${siteOrigin}/category/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      ...(siteDefaults.defaultOgImage ? { images: [{ url: siteDefaults.defaultOgImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, products] = await Promise.all([getCategory(slug), getProducts(slug)]);

  const name = category?.name ?? slug.replace(/-/g, " ");

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">{name}</h1>
        <Link
          href="/products"
          className="text-sm text-green-600 hover:text-green-800 font-semibold transition-colors"
        >
          All Products →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Check back soon or browse all products.</p>
          <Link
            href="/products"
            className="inline-block mt-4 text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
          >
            Browse all products →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{products.length} product{products.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
