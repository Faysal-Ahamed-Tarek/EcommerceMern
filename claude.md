# Role

You are an expert full-stack developer using Next.js (App Router), Node.js, Express, and MongoDB. Build scalable, production-grade features.

# Task
Implement a **Dynamic SEO Management System** for multiple static pages in an eCommerce admin panel.

The system should support SEO for:

* homepage
* all_products
* about
* privacy_policy
* terms_conditions

---
# Backend Requirements
## 1. Create SEO Model
Collection: seo_settings

Schema:

* page (string, required, unique)
  enum: ["homepage", "all_products", "about", "privacy_policy", "terms_conditions"]

* title (string, required, max 60 chars)

* description (string, required, max 320 chars)

* canonicalUrl (string)

* ogImage (string)

* keywords (string, optional)

* createdAt (date)

* updatedAt (date)

---

## 2. API Endpoints

### GET /api/seo/:page

* Returns SEO data for given page

### PUT /api/seo/:page

* Create or update SEO (upsert)

---

## 3. Controller Logic

* If document exists → update
* Else → create new (upsert = true)
* Validate:

  * title length ≤ 60
  * description length ≤ 320

Return structured response:
{
success: true,
data: {...}
}

---

# Frontend Admin Panel (Next.js)

## 1. Add New Menu

Sidebar:
👉 SEO Settings

---

## 2. Create Page: /admin/seo

## UI Structure:

Dropdown:

* Select Page:

  * Home
  * All Products
  * About Us
  * Privacy Policy
  * Terms & Conditions

---

## 3. Form Fields

* Meta Title (input)
* Meta Description (textarea + character counter)
* Canonical URL
* OG Image URL
* Keywords (comma separated)

---

## 4. Behavior

* On page select → call GET /api/seo/:page
* Prefill form
* Save → PUT /api/seo/:page
* Show success/error toast

---

## 5. UX Enhancements

* Live Google Preview:

  * Show how title + description appear in search

* Character limits:

  * Title: 50–60
  * Description: 150–160

* Placeholder examples per page:
  Example (homepage):
  "Best Online Shopping in Bangladesh | ShopBD"

---

# Frontend Store Integration (IMPORTANT)

Use Next.js App Router metadata API

For each page:

## Example: Homepage

export async function generateMetadata() {
const seo = await fetch('/api/seo/homepage').then(res => res.json())

return {
title: seo.data.title,
description: seo.data.description,
alternates: {
canonical: seo.data.canonicalUrl,
},
openGraph: {
images: [seo.data.ogImage],
},
}
}

---

Repeat same for:

* /products → page = all_products
* /about → page = about
* /privacy → page = privacy_policy
* /terms → page = terms_conditions

---

# Fallback Logic (CRITICAL)

If SEO is missing:

* title → default site title
* description → default tagline
* ogImage → default banner

---

# Bonus (Advanced)

* Cache SEO response (server-side)
* Add validation for URL format
* Prevent empty submissions
* Add "last updated" info in UI

---

# Output Requirements

* Mongoose model
* Express routes + controller
* Admin UI page
* API integration
* Next.js metadata integration

Code must be clean, modular, and production-ready.
