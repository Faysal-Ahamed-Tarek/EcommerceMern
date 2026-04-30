# ShopBD - E-Commerce Project Context

## Project Overview
A full-stack e-commerce platform built with Next.js (frontend) and Node.js/Express (backend), using MongoDB as the database. The application supports product management, orders, reviews, categories, hero slider management, admin panel, and static page content management.

**Target**: Production-grade scalable e-commerce system for online shopping in Bangladesh.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (for cart store)
- **HTTP Client**: Custom API wrapper (`lib/api.ts`)
- **Deployment Ready**: Server-side rendering (SSR) and static generation (SSG)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT-based admin auth
- **Validation**: Custom middleware + Joi schemas

### Database
- **MongoDB** with Mongoose ODM
- Collections: Admin, Category, Product, Review, Order, HeroSlide, HomeReview, PromoPanel, SiteConfig, StaticPage

---

## Project Structure

```
/Ecommerce
├── backend/                          # Express API server
│   ├── src/
│   │   ├── index.ts                  # Entry point, server setup
│   │   ├── controllers/              # Business logic
│   │   │   ├── adminController.ts
│   │   │   ├── productController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── reviewController.ts
│   │   │   ├── heroSlideController.ts
│   │   │   ├── homeReviewController.ts
│   │   │   ├── promoPanelController.ts
│   │   │   ├── siteConfigController.ts
│   │   │   └── staticPageController.ts
│   │   ├── models/                   # Mongoose schemas
│   │   │   ├── Admin.ts
│   │   │   ├── Product.ts
│   │   │   ├── Category.ts
│   │   │   ├── Order.ts
│   │   │   ├── Review.ts
│   │   │   ├── HeroSlide.ts
│   │   │   ├── HomeReview.ts
│   │   │   ├── PromoPanel.ts
│   │   │   ├── SiteConfig.ts
│   │   │   ├── StaticPage.ts
│   │   │   └── index.ts              # Model exports
│   │   ├── routes/                   # API endpoint definitions
│   │   ├── schemas/                  # Joi validation schemas
│   │   ├── middleware/               # Auth, error handling, validation
│   │   ├── lib/
│   │   │   └── db.ts                 # MongoDB connection
│   │   └── scripts/                  # Database seeding scripts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── globals.css           # Global styles
│   │   │   ├── (main)/               # Public store pages
│   │   │   │   ├── page.tsx          # Homepage
│   │   │   │   ├── about/
│   │   │   │   ├── privacy-policy/
│   │   │   │   ├── terms/
│   │   │   │   ├── products/         # All products listing
│   │   │   │   ├── category/[slug]/  # Category product listing
│   │   │   │   ├── checkout/
│   │   │   │   └── order-confirmation/
│   │   │   └── admin/                # Admin panel (protected routes)
│   │   │       ├── layout.tsx
│   │   │       ├── login/
│   │   │       ├── dashboard/
│   │   │       ├── categories/
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       ├── reviews/
│   │   │       ├── pages/
│   │   │       ├── content/
│   │   │       ├── theme/
│   │   │       └── seo/              # **SEO Settings page**
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── home/                 # Homepage sections
│   │   │   ├── layout/
│   │   │   ├── product/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   └── api.ts                # API request wrapper
│   │   ├── store/
│   │   │   └── cartStore.ts          # Zustand cart store
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
│
├── claude.md                         # Current SEO implementation task
├── instructions.md                   # Priority bugs & UX fixes
├── instructions2.md
├── instructions3.md
├── dashboard.md
├── database.md
├── frontend.md
└── productDetails.md
```

---

## Backend Architecture

### Express Setup
- **Entry Point**: `backend/src/index.ts`
- **Middleware Stack**: Error handling, validation, CORS
- **Routes**: Organized by feature (admin, category, product, order, review, etc.)

### Controllers Pattern
Each controller follows a standard pattern:
```typescript
export const getItem = async (req: Request, res: Response) => {
  try {
    // Business logic
    return res.json({ success: true, data: result });
  } catch (error) {
    // Error handling
  }
};
```

### Models (Mongoose)
All models are TypeScript interfaces with Mongoose schemas:
- Strong typing with interfaces
- Timestamps (createdAt, updatedAt) on most models
- Validation at schema level

### API Response Format
Standard response structure:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Authentication
- Admin JWT-based authentication
- Token stored in HTTP-only cookies (recommended)
- Routes protected by `auth` middleware

---

## Frontend Architecture

### App Router Structure
- **Public Routes**: `/(main)/*` - store pages (homepage, products, about, etc.)
- **Admin Routes**: `/admin/*` - protected admin panel
- **Layout Nesting**: Page-specific layouts override root layout

### API Integration
- Centralized API client: `lib/api.ts`
- Axios-based HTTP wrapper
- Handles base URL, headers, authentication

### State Management
- **Cart Store**: Zustand (`store/cartStore.ts`)
- **Component-level**: React hooks (useState, useContext)
- **No Redux** - kept minimal for simplicity

### Styling
- Tailwind CSS utility classes
- Global styles in `globals.css`
- Component-scoped styles via Tailwind classes

### Next.js Metadata API
For SEO on each page:
```typescript
export async function generateMetadata() {
  const seo = await fetch('/api/seo/:page').then(res => res.json())
  return {
    title: seo.data.title,
    description: seo.data.description,
    alternates: { canonical: seo.data.canonicalUrl },
    openGraph: { images: [seo.data.ogImage] }
  }
}
```

---

## Database Models (Collections)

### Admin
- Email, password hash, role, name

### Product
- Title, description, price, stock, category, slug, image URLs, order, ratings

### Category
- Name, slug, description, image

### Order
- Customer details, items, total, status (pending/confirmed/shipped/delivered)

### Review
- Product ID, rating, comment, author, verified purchase

### HeroSlide
- Title, description, image URL, link, order, active status

### HomeReview
- Content, author name, rating

### PromoPanel
- Title, description, image, link, active status

### SiteConfig
- General site settings (site name, tagline, contact info, etc.)

### StaticPage
- Content pages (about, privacy, terms) with slug-based routing

### SEO Settings (To be implemented)
- Page (enum), title, description, canonicalUrl, ogImage, keywords

---

## Current Features

### Product Management
- ✅ Add/Edit/Delete products
- ✅ Category assignment
- ✅ Stock tracking
- ✅ Product ratings & reviews
- ⚠️ Product ordering (needs fix)

### Admin Features
- ✅ User authentication
- ✅ Dashboard
- ✅ Category management
- ✅ Product management
- ✅ Order management
- ✅ Review management
- ✅ Hero slider management
- ✅ Home reviews section
- ✅ Static page content (about, privacy, terms)
- ✅ Site configuration
- 🔲 SEO management (**In Progress**)

### Store Features
- ✅ Homepage with hero slider, featured products, reviews
- ✅ Category browsing
- ✅ Product listing with filtering
- ✅ Shopping cart (Zustand)
- ✅ Checkout flow
- ✅ Order tracking
- ⚠️ Category filtering (bug exists)
- 🔲 SEO metadata (pending SEO implementation)

---

## API Endpoints (Summary)

### Admin
- `POST /api/admin/login` - Login
- `GET/POST /api/admin/` - Get/Create admin
- `PUT /api/admin/:id` - Update admin

### Categories
- `GET /api/category` - Get all categories
- `POST /api/category` - Create category
- `PUT /api/category/:id` - Update category
- `DELETE /api/category/:id` - Delete category

### Products
- `GET /api/product` - Get products (with filters/pagination)
- `POST /api/product` - Create product
- `PUT /api/product/:id` - Update product
- `DELETE /api/product/:id` - Delete product

### Orders
- `GET /api/order` - Get orders
- `POST /api/order` - Create order
- `PUT /api/order/:id` - Update order status

### Reviews
- `GET /api/review` - Get reviews
- `POST /api/review` - Create review

### Hero Slides
- `GET/POST/PUT/DELETE /api/hero-slide`

### Home Reviews
- `GET/POST/PUT/DELETE /api/home-review`

### Static Pages
- `GET /api/static-page/:slug` - Get page content
- `PUT /api/static-page/:slug` - Update page content

### SEO Settings (**To be implemented**)
- `GET /api/seo/:page` - Get SEO data for page
- `PUT /api/seo/:page` - Create/Update SEO data

---

## Development Conventions

### TypeScript
- Strong typing for all functions and variables
- Interfaces for data models
- No `any` type unless absolutely necessary

### Naming Conventions
- **Files**: camelCase (e.g., `productController.ts`)
- **Classes/Interfaces**: PascalCase (e.g., `IProduct`)
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Routes**: kebab-case (e.g., `/admin/categories/new-item`)
- **Database Slugs**: kebab-case

### Error Handling
- Try-catch blocks in all controllers
- Centralized error handler middleware
- Consistent error response format
- Log errors appropriately

### Code Organization
- One controller per feature
- Models with proper validation
- Routes organized by feature
- Schemas for input validation
- Middleware for cross-cutting concerns

---

## Key Files Reference

| Purpose | Path |
|---------|------|
| Server entry | `backend/src/index.ts` |
| MongoDB connection | `backend/src/lib/db.ts` |
| Model definitions | `backend/src/models/index.ts` |
| Frontend API wrapper | `frontend/src/lib/api.ts` |
| Root layout | `frontend/src/app/layout.tsx` |
| Admin layout | `frontend/src/app/admin/layout.tsx` |
| Cart store | `frontend/src/store/cartStore.ts` |
| Global styles | `frontend/src/app/globals.css` |

---

## Important Notes

### 1. Category Filtering Bug
- Issue: Categories not displaying products on frontend despite backend assignment
- Status: ⚠️ Needs investigation and fix
- Impact: Category pages and product filtering broken

### 2. Product Ordering
- Products should respect explicit `order` field
- Unordered products display in random order
- Status: ⚠️ Needs verification and testing

### 3. Hero Slider
- Images should be clickable and navigate to configured links
- Status: 🔲 Needs implementation

### 4. SEO Management System
- Currently missing dynamic SEO for static pages
- Need to implement backend model, API, and admin UI
- Reference: `claude.md` for full specification
- Pages: homepage, all_products, about, privacy_policy, terms_conditions

### 5. Fallback Metadata
- All pages should have fallback SEO data
- Use `generateMetadata()` in each page layout
- Fallback to site defaults if SEO not configured

---

## Development Workflow

1. **Backend Changes**: 
   - Update model/schema if needed
   - Update controller logic
   - Update validation schema
   - Test with API client (Postman/Thunder Client)

2. **Frontend Changes**:
   - Update component
   - Test locally with `npm run dev`
   - Verify API integration

3. **Database Changes**:
   - Create seed script if needed
   - Run migration/seed
   - Verify data in MongoDB

4. **Testing**:
   - Test in browser (homepage, category, products, admin)
   - Verify API responses
   - Check console for errors

---

## Environment Setup

### Backend
```bash
cd backend
npm install
npm run dev        # Development
npm run build      # Production build
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Development
npm run build      # Production build
```

### Database
- MongoDB connection via `.env` file
- Seed scripts in `backend/src/scripts/`

---

## Common Commands

```bash
# Backend
npm run dev        # Start dev server
npm run build      # Build TypeScript
npm run start      # Run production build

# Frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint

# Database
npm run seed       # Run seed scripts
```

---

## Notes for Claude

When working on this project:

1. **Always check existing models** - Don't duplicate schema definitions
2. **Follow the response format** - Use `{ success: true, data: ... }` pattern
3. **Test end-to-end** - Backend API → Frontend integration → Browser verification
4. **Production-first mindset** - Write scalable, maintainable code
5. **Error handling** - Every API call should handle errors gracefully
6. **TypeScript strict mode** - Leverage types for better code quality
7. **Refer to claude.md** - For specific implementation tasks

---

**Last Updated**: May 2026
**Project Status**: Active Development
