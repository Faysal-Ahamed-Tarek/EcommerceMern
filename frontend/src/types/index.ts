export interface ProductImage {
  cloudinaryUrl: string;
  publicId: string;
}

export interface ProductVariant {
  name: string;
  price: number;
  stock?: number;
  sku?: string;
}

export interface Product {
  _id: string;
  title: string;
  sku: string;
  slug: string;
  description: string;
  category: string;
  images: ProductImage[];
  variants: ProductVariant[];
  basePrice: number;
  DiscountPrice: number;
  totalStock?: number;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  isTopSelling: boolean;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface OrderItem {
  productSlug: string;
  title: string;
  variant: string;
  price: number;
  quantity: number;
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
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
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
