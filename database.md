# Role  
You are a senior full‑stack engineer building a production‑ready e‑commerce website from scratch.


# Project overview 
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js + Express.js, TypeScript
- **Database**: (or MongoDB + Mongoose)
- **Authentication**: JWT
- **Payment**: Cash On Delivery

The app must be **modular**, **well‑organized**, and **documented** (with clear folder structure and comments where needed). 


## STEP 1 DATABASE: MongoDB Schemas for E-commerce (~200 products)

Build **EXACT** Mongoose models for my e-commerce backend:

**FOLDER:** `/src/models/`

## 1. Product
```typescript
title: string
sku: string (unique)
slug: string (unique, SEO)
description: string (HTML)
category: string // category slug (denormalized)
images: [{ cloudinaryUrl: string, publicId: string }]
variants: [{
  name: string // "500g", "1kg"
  price: number
  stock?: number
  sku?: string
}]
basePrice: number
DiscountPrice: number
totalStock?: number
ratingAverage: number (default 0)
ratingCount: number (default 0)

isFeatured: boolean (default false)
status: 'draft' | 'published'
```
**Indexes:** slug, category, sku

## 2. Category  
```typescript
name: string
slug: string (unique)
image?: string // cloudinaryUrl
```

## 3. Order (DENORMALIZED - copy product data)
```typescript
orderId: string (unique, human readable e.g. ORD-1001)
note?: string
customerName: string
phone: string
address: string
items: [{
  productSlug: string
  title: string
  variant: string
  price: number
  quantity: number
}]
totalAmount: number
paymentMethod: 'cod'
paymentStatus: 'pending' | 'paid'
status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
createdAt: Date
```
**Indexes:** createdAt

## 4. Review
```typescript
productSlug: string
isVerifiedPurchase: boolean
orderId: string
customerName: string
rating: number (1-5)
comment: string
status: 'pending' | 'approved' | 'rejected'
```
**Indexes:** productSlug, status



## 5. Admin
```typescript
email: string (unique)
password: string (hashed)
role: 'admin'
```

## CORE RULES:
- `timestamps: true` ALL models
- `lean()` queries for speed
- **NO** deep population (denormalize where possible)
- Validation with Zod schemas
- TypeScript interfaces exported


## MODEL LOGIC
- Slug must be auto-generated from title
- Ensure uniqueness using suffix if duplicate
- Use Mongoose pre-save hooks for:
  - slug generation
  - hashing admin password (bcrypt)


## Basic Pagination Support
- All product listing APIs must support:
  - pagination (page, limit)
  - filtering (category, price range)
  - sorting (latest, price)



## Cart System
- Client-side cart (localStorage or Zustand)
- No backend cart storage
- Persist across refresh
- Validate with backend before checkout



## Stock Handling
- Validate stock before order creation
- Reject order if insufficient stock
- Reduce stock after order placement


**Deliver EXACTLY:**
1. `Product.ts`
2. `Category.ts` 
3. `Order.ts`
4. `Review.ts`
5. `Admin.ts`
6. `index.ts` (export all)

**Production-ready, indexed, scalable for 200 products.** No over-engineering!