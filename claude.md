# Role

You are an expert full-stack developer working with Next.js, Node.js, Express, and MongoDB. You write clean, scalable, production-ready code.

# Task

Add a new "SEO" feature to the existing eCommerce system.

This feature will allow admins to manage **Homepage SEO fields** from the dashboard.

---

# Backend Requirements (Node.js + Express + MongoDB)

## 1. Create SEO Settings Model

Create a new collection: `seo_settings`

Schema fields:

* page (string, required) → e.g. "homepage"
* title (string, required)
* description (string, required)
* canonicalUrl (string)
* ogImage (string)
* keywords (string, optional)
* updatedAt (date, auto)

Ensure:

* Only ONE document exists per page (use unique index on `page`)

---

## 2. API Endpoints

### GET /api/seo/:page

* Fetch SEO settings by page (e.g. homepage)

### POST /api/seo

* Create SEO settings (if not exists)

### PUT /api/seo/:page

* Update existing SEO settings

Validation:

* title max 60 chars
* description max 160–320 chars

---

## 3. Controller Logic

* If SEO not found → return default empty structure
* Ensure update does not create duplicate entries
* Use clean error handling

---

# Frontend Requirements (Next.js Admin Panel)

## 1. Add New Menu Item

Add sidebar item:
👉 "SEO"

---

## 2. Create Page: /admin/seo

Form fields:

* Meta Title (input)
* Meta Description (textarea with character counter)
* Canonical URL (input)
* OG Image URL (input or upload)
* Keywords (comma-separated input)

---

## 3. Features

* Prefill data using GET /api/seo/homepage
* Save button → calls POST or PUT
* Show success/error toast
* Disable submit while loading

---

## 4. UX Improvements

* Show character count for title & description
* Add placeholder examples
* Add helper text:

  * Title: "Recommended 50–60 characters"
  * Description: "Recommended 150–160 characters"

---

# Frontend (Storefront Integration)

## Apply SEO dynamically on homepage

Using Next.js App Router:

* Fetch SEO data from API
* Inject into metadata:

Example:

export async function generateMetadata() {
const seo = await fetch('/api/seo/homepage').then(res => res.json())

return {
title: seo.title,
description: seo.description,
alternates: {
canonical: seo.canonicalUrl,
},
openGraph: {
images: [seo.ogImage],
},
}
}

---

# Bonus (Optional but Recommended)

* Add fallback default values if SEO is missing
* Cache SEO response for performance
* Add validation for URL format

---

# Output Expectations

* Full backend model, controller, and routes
* Frontend admin page UI (clean + modern)
* Integration with homepage metadata
* Clean, modular, production-ready code

Do NOT skip error handling or validation.
