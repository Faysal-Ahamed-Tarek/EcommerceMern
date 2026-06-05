"use client";

import dynamic from "next/dynamic";
import LazySection from "@/components/home/LazySection";
import {
  ProductSectionSkeleton,
  PromoBannerSkeleton,
  ReviewsSkeleton,
  OutletsSkeleton,
} from "@/components/home/skeletons";
import type { Product, HomeReview, PromoPanel, Category } from "@/types";

const TopSellingSection = dynamic(() => import("@/components/home/TopSellingSection"), { ssr: false });
const FeaturedProducts = dynamic(() => import("@/components/home/FeaturedProducts"), { ssr: false });
const PromoBanner = dynamic(() => import("@/components/home/PromoBanner"), { ssr: false });
const CategoryCarousel = dynamic(() => import("@/components/home/CategoryCarousel"), { ssr: false });
const ReviewsSection = dynamic(() => import("@/components/home/ReviewsSection"), { ssr: false });
const Outlets = dynamic(() => import("@/components/home/Outlets"), { ssr: false });

interface CarouselSection {
  category: Category;
  products: Product[];
}

interface Props {
  topSellingProducts: Product[];
  featuredProducts: Product[];
  promoPanel: PromoPanel | null;
  carouselSections: CarouselSection[];
  reviews: HomeReview[];
}

export default function HomeLazySections({
  topSellingProducts,
  featuredProducts,
  promoPanel,
  carouselSections,
  reviews,
}: Props) {
  return (
    <>
      <LazySection skeleton={<ProductSectionSkeleton title="Top Selling" />}>
        <TopSellingSection products={topSellingProducts} />
      </LazySection>

      <LazySection skeleton={<ProductSectionSkeleton title="For you" />}>
        <FeaturedProducts products={featuredProducts} />
      </LazySection>

      <LazySection skeleton={<PromoBannerSkeleton />}>
        <PromoBanner panel={promoPanel} />
      </LazySection>

      {carouselSections.map(({ category, products }) => (
        <LazySection key={category._id} skeleton={<ProductSectionSkeleton title={category.name} />}>
          <CategoryCarousel
            categoryName={category.name}
            categorySlug={category.slug}
            products={products}
          />
        </LazySection>
      ))}

      <LazySection skeleton={<OutletsSkeleton />}>
        <Outlets />
      </LazySection>

      <LazySection skeleton={<ReviewsSkeleton />}>
        <ReviewsSection reviews={reviews} />
      </LazySection>
    </>
  );
}
