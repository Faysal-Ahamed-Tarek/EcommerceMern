# DrSkinC — Project Context

## Overview

Full-stack ecommerce platform for a Bangladesh-based skincare brand.

- **Store**: https://drskinc.com
- **Admin**: https://admin.drskinc.com
- **VPS**: 147.93.28.244 (Hostinger), Nginx reverse proxy
- **Status**: Production-ready, demo data removed, ready for real product uploads

---

## Tech Stack

### Frontend — `/frontend`
- Next.js **16.2.4** (App Router, React 19)
- TypeScript, Tailwind CSS v4
- Zustand (cart), Axios (`lib/api.ts`), react-hot-toast
- next-cloudinary for image uploads
- DOMPurify for HTML sanitisation in rich text fields

### Backend — `/backend`
- Express **5**, TypeScript, Node.js
- Mongoose + **MongoDB Atlas** (`cluster0.z46oscg.mongodb.net/ecommerce`)
- Zod for request validation
- jsonwebtoken (HTTP-only cookie auth)
- bcryptjs (password hashing, salt rounds 12)
- nodemailer (password reset emails via Gmail SMTP)
- express-rate-limit, helmet, compression, morgan

### Infrastructure
- PM2 (`ecosystem.config.js`) — two apps: `drskinc-backend` (port 5000), `drskinc-frontend` (port 3000)
- Nginx — reverse proxy, gzip, static caching, SSL (Let's Encrypt via certbot)
- Cloudinary — image hosting (`cloud: dxfexhh0y`, upload preset: `my_app_preset`)
- Deploy: `rsync` local → VPS, then `npm run build` + `pm2 restart`

---

## Project Structure

```
/Ecommerce
├── backend/src/
│   ├── index.ts                  # Server entry, route registration
│   ├── lib/
│   │   ├── db.ts                 # MongoDB connection
│   │   └── mailer.ts             # Nodemailer password-reset email
│   ├── controllers/
│   │   ├── adminController.ts    # Login, logout, stats, dashboard data, password reset
│   │   ├── productController.ts  # CRUD + carousel + in-memory cache
│   │   ├── categoryController.ts
│   │   ├── orderController.ts
│   │   ├── reviewController.ts
│   │   ├── homeReviewController.ts
│   │   ├── heroSlideController.ts
│   │   ├── siteConfigController.ts
│   │   ├── promoPanelController.ts
│   │   ├── staticPageController.ts
│   │   ├── seoController.ts
│   │   └── couponController.ts
│   ├── models/
│   │   ├── Admin.ts              # email, password (bcrypt), lockout fields, reset token
│   │   ├── Product.ts            # title, slug, description, variants, images, SEO fields
│   │   ├── Category.ts
│   │   ├── Order.ts              # items[], totalAmount, status, COD
│   │   ├── Review.ts             # productSlug, rating, status (pending/approved/rejected)
│   │   ├── HomeReview.ts         # homepage testimonials
│   │   ├── HeroSlide.ts
│   │   ├── PromoPanel.ts         # left/right banner pair
│   │   ├── SiteConfig.ts         # primaryColor, homeCategories, adminPanelName/Logo, favicon
│   │   ├── SEO.ts                # per-page SEO (title, description, ogImage, canonical)
│   │   ├── Coupon.ts
│   │   ├── StaticPage.ts
│   │   └── index.ts              # barrel exports
│   ├── routes/
│   │   ├── adminRoutes.ts        # All /api/admin/* routes
│   │   ├── productRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── reviewRoutes.ts
│   │   ├── homeReviewRoutes.ts
│   │   ├── seoRoutes.ts
│   │   └── couponRoutes.ts
│   ├── schemas/                  # Zod validation schemas
│   │   ├── productSchema.ts
│   │   ├── categorySchema.ts
│   │   ├── orderSchema.ts
│   │   ├── reviewSchema.ts
│   │   ├── couponSchema.ts
│   │   └── seoSchema.ts
│   ├── middleware/
│   │   ├── auth.ts               # JWT cookie verification → req.adminId
│   │   ├── errorHandler.ts       # Centralised error responses
│   │   └── validate.ts           # Zod schema middleware factory
│   └── scripts/
│       ├── seedAdmin.ts          # Create initial admin account
│       ├── resetAdmin.ts         # Reset password for anwarmdnoor@gmail.com
│       ├── seedProducts.ts       # Seeds from PRODUCTS[] — currently empty
│       ├── seedHomeReviews.ts    # Seeds from REVIEWS[] — currently empty
│       └── cleanseDemo.ts        # Wipe all products/reviews/categories/home-reviews

├── frontend/src/
│   ├── middleware.ts             # Rewrites admin.drskinc.com → /admin/* pages
│   ├── app/
│   │   ├── layout.tsx            # Root layout (ThemeProvider, fonts)
│   │   ├── (main)/               # Public store (no auth)
│   │   │   ├── page.tsx          # Homepage (SSR + lazy below-fold)
│   │   │   ├── products/         # All products listing + [slug] detail
│   │   │   ├── category/[slug]/  # Category product listing
│   │   │   ├── checkout/
│   │   │   ├── order-confirmation/
│   │   │   ├── about/
│   │   │   ├── privacy-policy/
│   │   │   └── terms/
│   │   └── admin/                # Admin panel (cookie-auth guarded)
│   │       ├── layout.tsx        # Sidebar nav, auth check, notifications polling
│   │       ├── login/
│   │       ├── forgot-password/
│   │       ├── reset-password/
│   │       ├── dashboard/        # Metric cards + Low Stock + Top Selling
│   │       ├── products/         # CRUD with Cloudinary upload + variants + SEO
│   │       ├── categories/
│   │       ├── orders/           # List + detail + receipt print
│   │       ├── reviews/          # Moderation (approve/reject)
│   │       ├── coupons/
│   │       ├── theme/            # Brand color, admin panel branding, favicon
│   │       ├── seo/              # Per-page SEO settings
│   │       ├── user/             # Change password
│   │       └── pages/            # home, shop, header, footer, about, privacy, terms
│   ├── components/
│   │   ├── home/
│   │   │   ├── HeroSlider.tsx
│   │   │   ├── TrustBadges.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── HomeLazySections.tsx  # IntersectionObserver lazy loader
│   │   │   ├── LazySection.tsx
│   │   │   ├── skeletons.tsx
│   │   │   ├── TopSellingSection.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── PromoBanner.tsx
│   │   │   ├── CategoryCarousel.tsx
│   │   │   └── ReviewsSection.tsx
│   │   ├── admin/
│   │   │   ├── RichTextEditor.tsx    # Contenteditable rich text with Cloudinary image insert
│   │   │   └── SEOPreview.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── product/ProductCard.tsx
│   │   ├── ThemeProvider.tsx         # Reads primaryColor from API, injects CSS vars
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts                    # Axios instance (withCredentials, 401 → /admin/login)
│   │   └── seo.ts
│   ├── store/cartStore.ts            # Zustand, persisted to localStorage
│   ├── context/SiteDataContext.tsx
│   ├── hooks/useDebounce.ts
│   └── types/index.ts               # All shared TypeScript interfaces

├── ecosystem.config.js              # PM2 config
├── production.md                    # VPS deployment step-by-step guide
├── CLAUDE.md                        # Task spec (dashboard restore, demo cleanup)
└── CONTEXT.md                       # This file
```

---

## Authentication

- **Method**: HTTP-only cookie (`adminToken`), JWT signed with `JWT_SECRET`
- **Expiry**: 1 hour (cookie + token); configurable via `JWT_EXPIRES_IN`
- **Account lockout**: 5 failed attempts → locked for 15 min (configurable via env)
- **Password reset**: Secure random token → SHA-256 hash stored in DB → email link → 1-hour expiry
- **Password rules**: 8+ chars, at least one digit, one special character
- **Admin email**: anwarmdnoor@gmail.com

---

## API Endpoints

All routes are under `/api/`. Admin routes require the `adminToken` cookie unless noted.

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/login` | No | Login; sets httpOnly cookie |
| POST | `/admin/logout` | Yes | Clears cookie |
| POST | `/admin/forgot-password` | No | Sends reset email (rate-limited 5/hr) |
| POST | `/admin/reset-password` | No | Consumes token, sets new password |
| GET | `/admin/me` | Yes | Current admin info |
| PATCH | `/admin/me/password` | Yes | Change password |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/stats` | Revenue, orders, products, today's orders |
| GET | `/admin/revenue-chart` | Time-series revenue data (daily/weekly/monthly) |
| GET | `/admin/low-inventory` | Published products with totalStock < 10 |
| GET | `/admin/top-selling` | Top 5 products by order quantity |
| GET | `/admin/notifications` | Pending order + review counts |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | No | Listing with filters (category, search, price, sort, featured, topSelling) |
| GET | `/products/carousel` | No | Multi-category carousel data |
| GET | `/products/:slug` | No | Single product by slug |
| POST | `/products` | Yes | Create |
| PUT | `/products/:id` | Yes | Update |
| DELETE | `/products/:id` | Yes | Delete |
| GET | `/admin/products` | Yes | All products (all statuses, paginated) |
| GET | `/admin/products/:id` | Yes | Single product by ID |

### Categories
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | No | All categories |
| POST | `/categories` | Yes | Create |
| PUT | `/categories/:id` | Yes | Update |
| DELETE | `/categories/:id` | Yes | Delete |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | No | Place order (COD) |
| GET | `/orders` | Yes | All orders (admin) |
| GET | `/orders/:id` | Yes | Order detail |
| PUT | `/orders/:id/status` | Yes | Update status |

### Reviews
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/reviews` | No | Approved reviews by productSlug |
| POST | `/reviews` | No | Submit review (goes to pending) |
| GET | `/admin/reviews` | Yes | All reviews (all statuses) |
| POST | `/admin/reviews` | Yes | Admin-create review |
| PUT | `/reviews/:id` | Yes | Approve/reject |
| DELETE | `/reviews/:id` | Yes | Delete |

### Other
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/home-reviews` | No | Active homepage testimonials |
| GET | `/slides` | No | Active hero slides |
| GET | `/config` | No | Site config (theme, homeCategories, branding) |
| PUT | `/admin/config` | Yes | Update site config |
| GET | `/promo-panel` | No | Two-banner promo panel |
| PUT | `/admin/promo-panel` | Yes | Update promo panel |
| GET | `/pages/:slug` | No | Static page content |
| PUT | `/admin/pages/:slug` | Yes | Update static page |
| GET | `/seo/:page` | No | SEO data for a page |
| PUT | `/seo/:page` | Yes | Update SEO for a page |
| GET/POST/PUT/DELETE | `/admin/slides` | Yes | Hero slides CRUD |

---

## Response Format

```json
// Success
{ "success": true, "data": { ... } }

// List with pagination
{ "success": true, "data": [...], "total": 100, "page": 1, "limit": 20 }

// Error
{ "success": false, "message": "Reason" }
```

---

## Product Model Key Fields

```typescript
{
  title, slug,           // slug auto-generated from title
  description,           // HTML (rich text)
  shortDescription,      // plain text, shown below price
  howToUse, ingredients, indications,  // rich text, optional
  sku,
  category,              // category name (string, not ObjectId)
  images: [{ cloudinaryUrl, publicId }],
  variants: [{ type, name, price, discountPrice, stock }],
  basePrice, DiscountPrice,   // used when no variants
  totalStock,            // total units across all variants
  ratingAverage, ratingCount,
  isFeatured, isTopSelling,
  status: 'draft' | 'published',
  order,                 // display order (lower = first)
  metaTitle, metaDescription, metaKeywords, ogImage, canonicalUrl
}
```

---

## Homepage Architecture

Server renders above-fold (HeroSlider, TrustBadges, CategoryGrid).
Everything below the fold is lazy-loaded via `HomeLazySections` using `IntersectionObserver` + Next.js dynamic imports with skeleton fallbacks.

Section order: TopSelling → FeaturedProducts → PromoBanner → CategoryCarousels (from SiteConfig.homeCategories) → ReviewsSection.

---

## Demo Data

All demo/seed data arrays are emptied. The `_REMOVED_PRODUCTS` and `_REMOVED_REVIEWS` variables in the seed scripts are reference-only and never executed.

To wipe any remaining demo data from the database:
```bash
cd backend
npm run cleanse:demo
```

---

## Admin Panel Navigation

Sidebar links: Dashboard, Products, Categories, Orders (badge: pending count), Reviews (badge: pending count), Coupons, Theme, SEO, Account, Pages (dropdown).

Notifications polled every 30 seconds via `/admin/notifications`.

---

## Key Scripts

```bash
# Backend (run from /backend)
npm run dev               # ts-node-dev dev server
npm run build             # tsc → dist/
npm run seed:admin        # Create admin account
npm run reset:admin       # Reset anwarmdnoor@gmail.com password
npm run cleanse:demo      # Wipe all demo content from DB
npm run seed:products     # Seed products (currently inserts nothing)
npm run seed:home-reviews # Seed home reviews (currently inserts nothing)

# Frontend (run from /frontend)
npm run dev               # Next.js dev server
npm run build             # Production build
```

---

## Environment Variables

### Backend (`backend/.env`)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
ADMIN_ALLOWED_ORIGINS=https://drskinc.com,https://admin.drskinc.com
ADMIN_LOGIN_MAX_ATTEMPTS=5
ADMIN_LOGIN_LOCK_MINUTES=15
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=anwarmdnoor@gmail.com
SMTP_PASS=<gmail app password>
```

### Frontend (`frontend/.env.production`)
```
NEXT_PUBLIC_API_URL=https://drskinc.com/api
NEXT_PUBLIC_SITE_URL=https://drskinc.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxfexhh0y
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=my_app_preset
```

---

## Deployment (Quick Reference)

Full guide in `production.md`. Summary:

```bash
# 1. Push code from local machine
rsync -avz --progress \
  --exclude 'node_modules' --exclude '.next' --exclude 'dist' \
  --exclude '.git' --exclude '.env.local' --exclude 'backend/.env' \
  /home/faysal/Desktop/Ecommerce/ root@147.93.28.244:/var/www/drskinc/

# 2. SSH into VPS
ssh root@147.93.28.244
cd /var/www/drskinc

# 3. Rebuild changed side(s)
cd backend && npm run build && cd ..   # if backend changed
cd frontend && npm run build && cd ..  # if frontend changed

# 4. Restart
pm2 restart all   # or: pm2 restart drskinc-backend / drskinc-frontend

# 5. Verify
pm2 status
curl https://drskinc.com/health
```

---

## Conventions

- **API responses**: always `{ success: true/false, data: ... }`
- **Validation**: Zod schemas in `backend/src/schemas/`; applied via `validate` middleware
- **Auth**: `protect` middleware in all admin-only routes; sets `req.adminId`
- **Product listing**: `sort=latest` uses `order` field (asc) + `$rand` for tie-breaking
- **Category lookup**: products use category `name` (string), not ObjectId; looked up from Category collection when filtering by slug
- **Image uploads**: Cloudinary via `CldUploadWidget`; store `{ cloudinaryUrl, publicId }` pairs
- **Rich text**: `RichTextEditor` component (contenteditable), sanitised with DOMPurify before save
- **Admin subdomain**: `frontend/src/middleware.ts` rewrites `admin.drskinc.com` requests → `/admin/*`

---

**Last updated**: May 2026
