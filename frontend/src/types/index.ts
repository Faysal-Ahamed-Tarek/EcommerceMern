export interface ProductImage {
  cloudinaryUrl: string;
  publicId: string;
}

export interface ProductVariant {
  type: string;
  name: string;
  price: number;
  discountPrice: number;
  stock?: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  howToUse?: string;
  ingredients?: string;
  sku?: string;
  category: string;
  images: ProductImage[];
  basePrice: number;
  DiscountPrice: number;
  variants?: ProductVariant[];
  totalStock?: number;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  isTopSelling: boolean;
  status: "draft" | "published";
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

export interface OrderItem {
  productSlug: string;
  title: string;
  variant: string;
  price: number;
  quantity: number;
  category?: string;
  image?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  note?: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryCharge?: number;
  paymentMethod: "cod";
  paymentStatus: "pending" | "paid";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  productSlug: string;
  isVerifiedPurchase: boolean;
  orderId?: string;
  customerName: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface CartItem {
  productSlug: string;
  title: string;
  image: string;
  variant: string;
  price: number;
  quantity: number;
}

export interface HeroSlide {
  _id: string;
  imageUrl: string;
  publicId: string;
  ctaLink: string;
  altText?: string;
  order: number;
  isActive: boolean;
}

export interface PromoPanelItem {
  imageUrl: string;
  publicId: string;
  link: string;
  altText: string;
}

export interface PromoPanel {
  _id: string;
  left: PromoPanelItem;
  right: PromoPanelItem;
}

export interface HomeReview {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  reviewerPhoto?: string;
  imageUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
