import type { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import TrustBadges from "@/components/home/TrustBadges";
import CategoryGrid from "@/components/home/CategoryGrid";
import HomeLazySections from "@/components/home/HomeLazySections";
import type { Product, HomeReview, HeroSlide, PromoPanel, Category, ApiResponse } from "@/types";

interface CarouselSection {
  category: Category;
  products: Product[];
}

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
  const seo = await getSEOData("homepage");
  return {
    title: seo?.title || "ShopBD - Best Online Shopping in Bangladesh",
    description: seo?.description || "Shop quality products online with fast delivery across Bangladesh.",
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: seo?.ogImage ? { images: [{ url: seo.ogImage }] } : undefined,
  };
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products?featured=true&limit=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json: ApiResponse<Product[]> = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getTopSellingProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products?topSelling=true&limit=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json: ApiResponse<Product[]> = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getHomeReviews(): Promise<HomeReview[]> {
  try {
    const res = await fetch(`${API}/home-reviews?limit=8`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const json: ApiResponse<HomeReview[]> = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const res = await fetch(`${API}/slides`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json: ApiResponse<HeroSlide[]> = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getPromoPanel(): Promise<PromoPanel | null> {
  try {
    const res = await fetch(`${API}/promo-panel`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json: ApiResponse<PromoPanel> = await res.json();
    return json.data ?? null;
  } catch { return null; }
}

async function getHomeCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.homeCategories ?? [];
  } catch { return []; }
}

async function getCarouselSections(slugs: string[]): Promise<CarouselSection[]> {
  if (!slugs.length) return [];
  try {
    const params = new URLSearchParams({ slugs: slugs.join(","), limit: "8" });
    const res = await fetch(`${API}/products/carousel?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

export default async function HomePage() {
  const [
    featuredProducts,
    topSellingProducts,
    reviews,
    slides,
    promoPanel,
    homeCategories,
  ] = await Promise.all([
    getFeaturedProducts(),
    getTopSellingProducts(),
    getHomeReviews(),
    getHeroSlides(),
    getPromoPanel(),
    getHomeCategories(),
  ]);

  const carouselSections = await getCarouselSections(homeCategories.slice(0, 2));

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-5">
      {/* Above fold — always eager, server-rendered */}
      <HeroSlider slides={slides} />
      <TrustBadges />
      <CategoryGrid />

      {/* Below fold — client-side lazy loaded via IntersectionObserver */}
      <HomeLazySections
        topSellingProducts={topSellingProducts}
        featuredProducts={featuredProducts}
        promoPanel={promoPanel}
        carouselSections={carouselSections}
        reviews={reviews}
      />
    </main>
  );
}
