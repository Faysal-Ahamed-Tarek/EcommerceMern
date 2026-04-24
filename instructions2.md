# Role  
You are an expert React/Next.js developer specializing in e-commerce UIs with Tailwind CSS.

## 1. CRITICAL BUG FIX 
**Products page:** "0 products found" shows EVEN AFTER search results. 
- Make functional: Show actual count "X products found"
- http://localhost:3000/products


## 2. CRITICAL BUG FIX
**Admin Categories:** Show product count per category


## 3. NEW FEATURES ON HEADER HEADER
"🚚 Free delivery on orders above ৳999"  
"Cash on Delivery available across Bangladesh"
- Infinite right→left scroll (CSS marquee/Tailwind)
- in admin content, admin can edit texts array
- add these two things in the texts array for now


### 4. Product Details - Enhanced Layout
**NEW FIELDS (Admin Product):**
```typescript
shortDescription: string (required)  // After price, before quantity
howToUse: string (optional, HTML)    // Tab 1
ingredients: string (optional, HTML) // Tab 2
sku: string (optional, random gen)   // e.g. "PROD-XYZ123"
```

**UI Changes:**
- **Sticky image:** Left sidebar fixed on scroll (if content tall)
- **Short desc:** Price → shortDescription → Tabs → quantity selector
- **Tabs:** "How to Use" | "Ingredients" (show only if content exists)
- **Reviews form:** Name, Rating(1-5), Comment, Image upload (Cloudinary)
  - Submit → pending status → admin approve/edit/delete


### 3. SKU System
- Add `sku: string` to Product model (optional)
- Admin: Auto-generate random "PROD-ABC123" for existing products


## 🎯 RULES:
- **Server Components** everywhere possible
- **Tailwind responsive** (mobile-first)
- **Zod validation** all forms
- **Next.js Image** (Cloudinary optimized)
- **TypeScript** strict
- **SEO:** Dynamic meta for product pages

**MVP-first: Fix bugs → headers → Product details → SKU**

Test-ready, production code. Complete files only!