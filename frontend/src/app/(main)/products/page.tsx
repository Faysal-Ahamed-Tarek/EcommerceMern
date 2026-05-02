import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Code-split the heavy client component; Suspense below handles the loading state
const ProductsContent = dynamic(
  () => import("./ProductsClient").then((m) => ({ default: m.ProductsContent }))
);

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
  const title = seo?.title || "All Products | ShopBD";
  const description =
    seo?.description || "Browse our complete collection of quality products at the best prices.";

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      ...(seo?.ogImage ? { images: [{ url: seo.ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(seo?.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={28} />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
