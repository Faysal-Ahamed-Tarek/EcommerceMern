import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import type { Product, ApiResponse } from "@/types";
import { getSiteOrigin, stripHtml, truncate, buildCanonical } from "@/lib/seo";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json: ApiResponse<Product> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

interface SiteDefaults {
  siteUrl?: string;
  storeName?: string;
  defaultOgImage?: string;
  defaultMetaDescription?: string;
}

async function getSiteDefaults(): Promise<SiteDefaults> {
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data ?? {};
  } catch {
    return {};
  }
}

function buildProductJsonLd(product: Product, siteOrigin: string) {
  const effectivePrice =
    product.variants && product.variants.length > 0
      ? product.variants[0].discountPrice > 0
        ? product.variants[0].discountPrice
        : product.variants[0].price
      : product.DiscountPrice > 0
      ? product.DiscountPrice
      : product.basePrice;

  const inStock =
    product.totalStock !== undefined ? product.totalStock > 0 : true;

  const canonical = buildCanonical(siteOrigin, product.slug);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: truncate(stripHtml(product.description), 300),
    image: product.images[0]?.cloudinaryUrl,
    url: canonical,
    offers: {
      "@type": "Offer",
      price: effectivePrice,
      priceCurrency: "BDT",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: canonical,
    },
  };

  if (product.sku) jsonLd.sku = product.sku;

  if (product.ratingCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingAverage,
      reviewCount: product.ratingCount,
    };
  }

  return jsonLd;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, siteDefaults] = await Promise.all([
    getProduct(slug),
    getSiteDefaults(),
  ]);

  if (!product) return { title: "Product Not Found" };

  const siteOrigin = getSiteOrigin(siteDefaults.siteUrl);

  const title = truncate((product.metaTitle || product.title).trim(), 60);

  const rawDesc =
    product.metaDescription ||
    stripHtml(product.description) ||
    siteDefaults.defaultMetaDescription ||
    "";
  const description = truncate(rawDesc, 160);

  const canonical = product.canonicalUrl || buildCanonical(siteOrigin, slug);

  // Collect og:images — explicit ogImage first, then all product images, then site default
  const seen = new Set<string>();
  const ogImages: { url: string }[] = [];
  const addOgImage = (url: string) => {
    if (url && !seen.has(url)) { seen.add(url); ogImages.push({ url }); }
  };
  if (product.ogImage) addOgImage(product.ogImage);
  product.images.forEach((img) => addOgImage(img.cloudinaryUrl));
  if (ogImages.length === 0 && siteDefaults.defaultOgImage)
    addOgImage(siteDefaults.defaultOgImage);

  return {
    title,
    description,
    keywords: product.metaKeywords || undefined,
    alternates: { canonical },
    robots: product.status === "draft" ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: ogImages,
      siteName: siteDefaults.storeName || undefined,
      locale: "en_BD",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.length > 0 ? [ogImages[0].url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, siteDefaults] = await Promise.all([
    getProduct(slug),
    getSiteDefaults(),
  ]);
  if (!product) notFound();

  const siteOrigin = getSiteOrigin(siteDefaults.siteUrl);
  const jsonLd = buildProductJsonLd(product, siteOrigin);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
