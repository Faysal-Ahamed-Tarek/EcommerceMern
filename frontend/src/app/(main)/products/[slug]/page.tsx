import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import type { Product, ApiResponse } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json: ApiResponse<Product> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const title = product.metaTitle || product.title;
  const description =
    product.metaDescription ||
    product.description.replace(/<[^>]+>/g, "").slice(0, 160);
  const ogImage = product.ogImage || product.images[0]?.cloudinaryUrl || "";
  const keywords = product.metaKeywords || undefined;

  return {
    title,
    description,
    keywords,
    alternates: product.canonicalUrl
      ? { canonical: product.canonicalUrl }
      : undefined,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
