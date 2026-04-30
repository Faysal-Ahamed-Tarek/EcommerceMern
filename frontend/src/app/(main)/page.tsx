import HeroSlider from "@/components/home/HeroSlider";
import TrustBadges from "@/components/home/TrustBadges";
import CategoryGrid from "@/components/home/CategoryGrid";
import TopSellingSection from "@/components/home/TopSellingSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoBanner from "@/components/home/PromoBanner";
import ReviewsSection from "@/components/home/ReviewsSection";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import type { Product, HomeReview, HeroSlide, PromoPanel, Category, ApiResponse } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

async function getAllCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json: ApiResponse<Category[]> = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products?category=${encodeURIComponent(categorySlug)}&limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<Product[]> = await res.json();
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
    allCategories,
  ] = await Promise.all([
    getFeaturedProducts(),
    getTopSellingProducts(),
    getHomeReviews(),
    getHeroSlides(),
    getPromoPanel(),
    getHomeCategories(),
    getAllCategories(),
  ]);

  const selectedSlugs = homeCategories.slice(0, 2);
  const categoryProductPairs = await Promise.all(
    selectedSlugs.map(async (slug) => {
      const cat = allCategories.find((c) => c.slug === slug);
      if (!cat) return null;
      const products = await getProductsByCategory(slug);
      return { category: cat, products };
    })
  );
  const carouselSections = categoryProductPairs.filter(Boolean) as {
    category: Category;
    products: Product[];
  }[];

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-5">
      <HeroSlider slides={slides} />
      <TrustBadges />
      <CategoryGrid />
      <TopSellingSection products={topSellingProducts} />
      <FeaturedProducts products={featuredProducts} />
      <PromoBanner panel={promoPanel} />
      {carouselSections.map(({ category, products }) => (
        <CategoryCarousel
          key={category._id}
          categoryName={category.name}
          categorySlug={category.slug}
          products={products}
        />
      ))}
      <ReviewsSection reviews={reviews} />
    </main>
  );
}
