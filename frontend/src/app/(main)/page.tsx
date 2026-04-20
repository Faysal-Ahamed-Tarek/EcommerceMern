import HeroSlider from "@/components/home/HeroSlider";
import TrustBadges from "@/components/home/TrustBadges";
import CategoryGrid from "@/components/home/CategoryGrid";
import TopSellingSection from "@/components/home/TopSellingSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoBanner from "@/components/home/PromoBanner";
import ReviewsSection from "@/components/home/ReviewsSection";
import type { Product, Review, HeroSlide, PromoPanel, ApiResponse } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products?featured=true&limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<Product[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getTopSellingProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products?topSelling=true&limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<Product[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getApprovedReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${API}/reviews?status=approved&limit=6`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<Review[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const res = await fetch(`${API}/slides`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json: ApiResponse<HeroSlide[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getPromoPanel(): Promise<PromoPanel | null> {
  try {
    const res = await fetch(`${API}/promo-panel`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json: ApiResponse<PromoPanel> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [featuredProducts, topSellingProducts, reviews, slides, promoPanel] = await Promise.all([
    getFeaturedProducts(),
    getTopSellingProducts(),
    getApprovedReviews(),
    getHeroSlides(),
    getPromoPanel(),
  ]);

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-5 pb-16">
      <HeroSlider slides={slides} />
      <TrustBadges />
      <CategoryGrid />
      <TopSellingSection products={topSellingProducts} />
      <FeaturedProducts products={featuredProducts} />
      <PromoBanner panel={promoPanel} />
      <ReviewsSection reviews={reviews} />
    </main>
  );
}
