import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { ProductsContent } from "./ProductsClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getSEOData(page: string) {
  try {
    const res = await fetch(`${API}/seo/${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOData("all_products");
  return {
    title: seo?.title || "All Products | ShopBD",
    description: seo?.description || "Browse our complete collection of quality products at the best prices.",
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: seo?.ogImage ? { images: [{ url: seo.ogImage }] } : undefined,
  };
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={28} /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
