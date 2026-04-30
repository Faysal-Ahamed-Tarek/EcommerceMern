# Role
You are an expert full-stack developer experienced with **Next.js (App Router), Express.js, MongoDB, TypeScript, Zod validation, and React**.

Build **scalable, production-grade features** that match this project's conventions (see CONTEXT.md for project overview).

---

# Task: Static Page SEO Management System

Implement a **Dynamic SEO Management System** for 5 static pages:
- `homepage` → `/`
- `all_products` → `/products`
- `about` → `/about`
- `privacy_policy` → `/privacy-policy`
- `terms_conditions` → `/terms`

---

# PHASE 1: BACKEND - SEO Model & Validation

## 1.1 Create SEO Model
**File**: `backend/src/models/SEO.ts`

```typescript
// TypeScript Interface + Mongoose Schema (same pattern as Admin.ts, Product.ts)
// Export both interface and default model

interface ISEO extends Document {
  page: 'homepage' | 'all_products' | 'about' | 'privacy_policy' | 'terms_conditions';
  title: string;              // Required, 5-60 chars, no HTML tags
  description: string;        // Required, 10-320 chars, no HTML tags  
  canonicalUrl?: string;      // Optional, valid absolute URL (http/https) OR empty
  ogImage?: string;           // Optional, valid absolute URL OR empty
  keywords?: string;          // Optional, max 200 chars, comma-separated
  createdAt: Date;
  updatedAt: Date;
}

Schema:
- page: String, required, unique index, enum validation
- title: String, required, trim, maxlength 60
- description: String, required, trim, maxlength 320
- canonicalUrl: String, optional
- ogImage: String, optional
- keywords: String, optional, maxlength 200
- timestamps: true (createdAt, updatedAt auto-managed)

Collection name: 'seo_settings'
```

**Export in** `backend/src/models/index.ts`:
```typescript
export { default as SEO } from './SEO';
export type { ISEO } from './SEO';
```

---

## 1.2 Create SEO Validation Schema
**File**: `backend/src/schemas/seoSchema.ts`

Use Zod (like productSchema.ts uses Zod).

```typescript
export const updateSEOSchema = z
  .object({
    title: z.string().min(5).max(60).trim(),
    description: z.string().min(10).max(320).trim(),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
    ogImage: z.string().url().optional().or(z.literal('')),
    keywords: z.string().max(200).optional(),
  })
  .refine(
    (data) => data.title && data.description,
    { message: 'Title and description are required' }
  );
```

---

## 1.3 Create SEO Controller
**File**: `backend/src/controllers/seoController.ts`

Follow the pattern from `productController.ts` (async/await, try-catch, next(err)).

**Function**: `getSEO(req: Request, res: Response, next: NextFunction)`
- Route: `GET /api/seo/:page`
- Validate `page` param against enum
- Query: `SEO.findOne({ page: req.params.page })`
- Return: `{ success: true, data: seoData }` (even if null, still success: true)
- Error: Pass to `next(err)` for centralized error handler

**Function**: `createOrUpdateSEO(req: Request, res: Response, next: NextFunction)`
- Route: `PUT /api/seo/:page`
- Validate `page` param against enum
- Validate body with `updateSEOSchema`
- Use: `SEO.findOneAndUpdate({ page }, req.body, { upsert: true, new: true, runValidators: true })`
- Return: `{ success: true, data: updatedSEO, message: 'SEO updated successfully' }`
- Error: Pass to `next(err)`

**Error Handling** (middleware will handle, but be explicit):
- 400: Invalid page enum → `new Error('Invalid page')`
- 400: Validation fails → let validate middleware handle (Zod will return 400)
- 401: Unauthorized (if not admin) → let protect middleware handle

---

## 1.4 Create SEO Routes
**File**: `backend/src/routes/seoRoutes.ts`

Follow pattern from `productRoutes.ts`:

```typescript
import { Router } from 'express';
import { getSEO, createOrUpdateSEO } from '../controllers/seoController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateSEOSchema } from '../schemas/seoSchema';

const router = Router();

router.get('/:page', getSEO);                              // Public
router.put('/:page', protect, validate(updateSEOSchema), createOrUpdateSEO);  // Admin only

export default router;
```

---

## 1.5 Register SEO Routes in Main App
**File**: `backend/src/index.ts`

Add after other route imports:
```typescript
import seoRoutes from './routes/seoRoutes';

// ... in app setup, after line: app.use('/api/pages/:slug', getStaticPage);
app.use('/api/seo', seoRoutes);
```

---

## 1.6 (OPTIONAL) Database Seed Script
**File**: `backend/src/scripts/seedSEO.ts`

Prepopulate SEO defaults for all 5 pages (helps admin see defaults):

```typescript
// Each page object should have:
// page, title, description, canonicalUrl, ogImage, keywords

// Examples:
{
  page: 'homepage',
  title: 'Best Online Shopping in Bangladesh | dr skincare',
  description: 'Discover premium products with fast delivery across Bangladesh. Shop electronics, fashion, home & more at dr skincare.',
  canonicalUrl: 'https://dr skincare.com',
  ogImage: 'https://dr skincare.com/og-banner.png',
  keywords: 'online shopping, Bangladesh, ecommerce, best prices'
}

{
  page: 'all_products',
  title: 'All Products | dr skincare',
  description: 'Browse our complete collection of quality products. Find the best deals on electronics, fashion, home, and more.',
  canonicalUrl: 'https://dr skincare.com/products',
  ogImage: 'https://dr skincare.com/og-products.png',
  keywords: 'products, online store, Bangladesh'
}

// ... repeat for about, privacy_policy, terms_conditions
```

---

# PHASE 2: BACKEND - API Testing

**Test these endpoints**:

```bash
# Get SEO for homepage (public)
GET http://localhost:5000/api/seo/homepage

# Update homepage SEO (admin only, requires Bearer token)
PUT http://localhost:5000/api/seo/homepage
Authorization: Bearer <admin_jwt_token>
Body:
{
  "title": "Best Online Shopping in Bangladesh | dr skincare",
  "description": "Discover premium products with fast delivery across Bangladesh.",
  "canonicalUrl": "https://dr skincare.com",
  "ogImage": "https://dr skincare.com/og-banner.png",
  "keywords": "shopping, Bangladesh, ecommerce"
}

# Test all 5 page enums
GET /api/seo/homepage
GET /api/seo/all_products
GET /api/seo/about
GET /api/seo/privacy_policy
GET /api/seo/terms_conditions
```

---

# PHASE 3: FRONTEND ADMIN - SEO Management Page

## 3.1 Create Admin Page
**File**: `frontend/src/app/admin/seo/page.tsx`

**Component Structure**:
1. Page selector dropdown (5 options)
2. Form with 5 fields: title, description, canonicalUrl, ogImage, keywords
3. Character counters for title & description
4. Google Search Preview component
5. Save button with loading state
6. Success/Error toast notifications

**Behavior**:
- On mount or page selection: Fetch `GET /api/seo/:page` via api client
- Prefill form with fetched data
- Show loading skeleton while fetching
- On save: Validate client-side, then `PUT /api/seo/:page`
- Show success toast on save
- Show error toast on failure

**Key Features**:
- Page state: current selected page (homepage default)
- Form state: title, description, canonicalUrl, ogImage, keywords
- Loading state: fetching, saving
- Real-time character counter for title (show 5-60) and description (show 10-320)

---

## 3.2 Google Search Preview Component
Create component `frontend/src/components/admin/SEOPreview.tsx`

Displays real-time preview of how title + description appear in Google Search:
```
dr skincare - Best Online Shopping
dr skincare.com › homepage
Discover premium products with fast delivery. Shop now!
```

Update as user types in title/description fields.

---

## 3.3 Add Sidebar Menu Item
**File**: `frontend/src/app/admin/layout.tsx`

In `NAV_LINKS` array, add:
```typescript
{ label: "SEO Settings", href: "/admin/seo", icon: Search }, // or Globe icon
```

Import icon from lucide-react.

---

# PHASE 4: FRONTEND STORE - Add Metadata to Static Pages

For EACH of these 5 pages, add `generateMetadata()` function:

## 4.1 Homepage
**File**: `frontend/src/app/(main)/page.tsx`

Add at top (before component):
```typescript
import { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getSEOData(page: string) {
  try {
    const res = await fetch(`${API_URL}/seo/${page}`, {
      next: { revalidate: 3600 } // Cache 1 hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOData('homepage');
  
  return {
    title: seo?.title || 'dr skincare - Best Online Shopping in Bangladesh',
    description: seo?.description || 'Shop quality products online with fast delivery',
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: seo?.ogImage ? { 
      images: [{ url: seo.ogImage }] 
    } : undefined,
  };
}
```

## 4.2 All Products Page
**File**: `frontend/src/app/(main)/products/page.tsx`
- Use `getSEOData('all_products')`
- Fallback title: `'All Products | dr skincare'`

## 4.3 About Page
**File**: `frontend/src/app/(main)/about/page.tsx`
- Use `getSEOData('about')`
- Fallback title: `'About Us | dr skincare'`

## 4.4 Privacy Policy Page
**File**: `frontend/src/app/(main)/privacy-policy/page.tsx`
- Use `getSEOData('privacy_policy')`
- Fallback title: `'Privacy Policy | dr skincare'`

## 4.5 Terms & Conditions Page
**File**: `frontend/src/app/(main)/terms/page.tsx`
- Use `getSEOData('terms_conditions')`
- Fallback title: `'Terms & Conditions | dr skincare'`

---

# PHASE 5: Testing & Validation

## Backend Tests
- [ ] GET /api/seo/homepage returns `{ success: true, data: {...} }`
- [ ] PUT /api/seo/homepage (admin) creates new or updates existing
- [ ] Title validation: reject if <5 or >60 chars
- [ ] Description validation: reject if <10 or >320 chars
- [ ] Invalid page enum returns 400 error
- [ ] Non-admin user gets 401 on PUT
- [ ] Upsert works: PUT twice, 2nd time updates not creates duplicate

## Frontend Admin Tests
- [ ] Page dropdown changes and fetches new data
- [ ] Form prefills with fetched SEO data
- [ ] Character counter shows title chars (5/60, 10/320)
- [ ] Google preview updates real-time
- [ ] Save button validates before sending
- [ ] Success toast shows after save
- [ ] Error toast shows on validation/network failure
- [ ] Last updated timestamp shows (optional but nice)

## Frontend Store Tests
- [ ] Browser DevTools → head tag shows `<title>`, `<meta name="description">`
- [ ] Open inspector on `/`: homepage title visible
- [ ] Open inspector on `/products`: all_products title visible
- [ ] Open inspector on `/about`: about title visible
- [ ] Open inspector on `/privacy-policy`: privacy_policy title visible
- [ ] Open inspector on `/terms`: terms_conditions title visible
- [ ] Canonical URLs show in meta tag
- [ ] OG images present in og:image meta

---

# Implementation Order

1. ✅ Backend: SEO Model (SEO.ts)
2. ✅ Backend: SEO Validation Schema (seoSchema.ts)
3. ✅ Backend: SEO Controller (seoController.ts)
4. ✅ Backend: SEO Routes (seoRoutes.ts)
5. ✅ Backend: Register routes in index.ts
6. ✅ Backend: Optional seed script
7. ✅ Backend: Test API endpoints
8. ✅ Frontend Admin: Create /admin/seo page
9. ✅ Frontend Admin: Create SEO Preview component
10. ✅ Frontend Admin: Add menu item to sidebar
11. ✅ Frontend Store: Add generateMetadata() to all 5 pages
12. ✅ Full end-to-end testing

---

# Code Examples Reference

**Model Pattern** (from Admin.ts):
```typescript
export interface IAdmin extends Document { ... }
const AdminSchema = new Schema<IAdmin>({ ... }, { timestamps: true });
const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
export default Admin;
```

**Controller Pattern** (from productController.ts):
```typescript
export const getItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Model.findOne(...);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);  // Pass to error middleware
  }
};
```

**Validation Pattern** (from productSchema.ts):
```typescript
export const updateItemSchema = z.object({
  field1: z.string().min(1).max(100),
  field2: z.number().optional(),
});
```

**Route Pattern** (from productRoutes.ts):
```typescript
router.get('/', getItems);
router.post('/', protect, validate(schema), createItem);
router.put('/:id', protect, validate(schema), updateItem);
```

**Frontend Admin Pattern** (from categories/page.tsx):
```typescript
const [items, setItems] = useState([]);
const [form, setForm] = useState({});
const [saving, setSaving] = useState(false);

const handleSave = async (e) => {
  e.preventDefault();
  setSaving(true);
  try {
    await api.put(`/endpoint/:id`, form);
    toast.success('Saved!');
  } catch (err) {
    toast.error('Error!');
  } finally {
    setSaving(false);
  }
};
```

**Frontend Metadata Pattern** (new):
```typescript
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOData('page_name');
  return {
    title: seo?.title || 'Default Title',
    description: seo?.description || 'Default Description',
  };
}
```

---

# Important Notes

1. **Auth on PUT**: Use `protect` middleware (from productRoutes.ts) - already handles JWT validation
2. **Upsert Logic**: Use `findOneAndUpdate({ page }, body, { upsert: true, new: true })`
3. **Validation**: Use Zod (NOT Joi) - matches your existing schemas
4. **Error Handling**: Throw errors or use `next(err)` - errorHandler middleware catches all
5. **Response Format**: Always `{ success: true, data: ... }` or `{ success: false, message: ... }`
6. **Fallback SEO**: Provide sensible defaults if database is empty
7. **Caching**: Use `next: { revalidate: 3600 }` in fetch to cache 1 hour (can be reduced)
8. **Character Limits**: Title 5-60 (show 60/60), Description 10-320 (show 320/320)

---

# Deliverables

**Backend** (3 files):
- ✅ `backend/src/models/SEO.ts` - Model with interface
- ✅ `backend/src/schemas/seoSchema.ts` - Zod validation
- ✅ `backend/src/controllers/seoController.ts` - Get & Create/Update logic
- ✅ `backend/src/routes/seoRoutes.ts` - Public GET, Protected PUT
- ✅ Update `backend/src/models/index.ts` - Export SEO model
- ✅ Update `backend/src/index.ts` - Register routes
- ✅ (Optional) `backend/src/scripts/seedSEO.ts` - Seed default data

**Frontend Admin** (2-3 files):
- ✅ `frontend/src/app/admin/seo/page.tsx` - Full admin page with form
- ✅ `frontend/src/components/admin/SEOPreview.tsx` - Google preview component (optional)
- ✅ Update `frontend/src/app/admin/layout.tsx` - Add menu item

**Frontend Store** (6 updates):
- ✅ Update `frontend/src/app/(main)/page.tsx` - Homepage metadata
- ✅ Update `frontend/src/app/(main)/products/page.tsx` - Products metadata
- ✅ Update `frontend/src/app/(main)/about/page.tsx` - About metadata
- ✅ Update `frontend/src/app/(main)/privacy-policy/page.tsx` - Privacy metadata
- ✅ Update `frontend/src/app/(main)/terms/page.tsx` - Terms metadata

---

**Status**: Ready for implementation.
**Difficulty**: Medium (straightforward CRUD, follows existing patterns).
**Estimated Time**: 3-4 hours end-to-end.
