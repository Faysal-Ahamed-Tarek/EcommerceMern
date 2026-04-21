# Role
You are a senior full-stack engineer working on an existing e-commerce admin dashboard.

Tech context:
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose)

# Objective
Improve the Admin Dashboard UX and data model with the following exact requirements.

## Required Changes

## 1. Create/Edit popup width
- Product create and edit popups/modals in dashboard should be in a different page not pop up
- Keep mobile responsiveness intact.
- Do not break existing spacing or form usability.

2. Rich formatted description support
- Dashboard product description input must support formatted text (rich text) so admin can paste ChatGPT-generated formatted content directly.
- Allow common formatting:
	- headings
	- bold/italic
	- bullet and numbered lists
	- links
	- paragraph spacing
- Store safe HTML (or structured format converted safely to HTML).
- Sanitize content to prevent XSS.

3. Delete icon for orders
- Add a delete action icon/button for each order row in dashboard orders table.
- Action must include confirmation dialog before deletion.
- Use soft delete or hard delete based on current backend pattern; keep behavior consistent.
- Show success and failure toast/feedback.

4. Order filtering
- Orders must be filterable by:
	- date (single date or date range)
	- category
- Category filter should work against ordered product categories.
- Filters should combine (date + category together).
- Preserve pagination compatibility if pagination exists.

5. Remove SKU completely
- SKU is no longer needed.
- Remove SKU from:
	- backend product schema and validation
	- create/edit product forms in dashboard
	- product table/list columns
	- product details/admin views
	- any API payload typing where SKU is required
- Keep backward compatibility for old records that still have SKU stored in DB.

6. Product SEO fields in dashboard
- Add necessary SEO fields in product create/edit dashboard forms:
	- metaTitle
	- metaDescription
	- metaKeywords (optional string or array)
	- ogImage (optional, fallback to product image)
	- canonicalUrl (optional)
- Persist these fields in backend model and API.
- Use these fields in frontend product page metadata generation.

# Implementation Guidance

## Frontend (Dashboard)
- create/edit modal in a different page
- Integrate a rich text editor component for product description.
- Add order delete icon action with confirmation modal.
- Add filter UI controls on orders page:
	- date picker/date range
	- category dropdown
	- clear filters button

## Backend
- Update product model/types to remove SKU requirement and add SEO fields.
- Update product validation schema accordingly.
- Update order listing endpoint to support query params for date and category filtering.
- Add order delete endpoint/controller action if not already present.

## Security and Validation
- Sanitize rich text description before save and/or before render.
- Validate SEO field lengths (reasonable limits).
- Validate order delete permissions for admin only.

# Acceptance Criteria
- Product create/edit popup is on a different page on desktop and still responsive on mobile.
- Admin can paste formatted ChatGPT text in description and formatting is preserved.
- Order rows include delete icon with confirmation and working deletion.
- Orders can be filtered by date and category together.
- SKU is fully removed from dashboard flow and required validation.
- Product SEO fields are available in dashboard and saved successfully.
- Frontend metadata uses SEO fields when present.
- No TypeScript or runtime errors.

# Output Format For Claude
Return all of the following:

1. Short execution plan.
2. File-by-file code changes.
3. Data model/validation changes.
4. API changes (new or updated endpoints and query params).
5. Manual test checklist.
6. Any migration/backward-compatibility notes.

