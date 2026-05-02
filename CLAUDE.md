# Product Detail Client Optimization Prompt

Use this prompt to optimize the product details experience at `/products/[slug]` (for example: `http://localhost:3000/products/usb-c-fast-charger-65w`).

The page includes:
- Product details and gallery
- Variant selection
- Add to cart / buy now
- Reviews with optional image upload

## Core Rule

If any optimization task is already implemented in the project, do not implement it again.

Before making changes:
1. Audit existing code paths and behavior.
2. Mark each item as `Already Done` or `Needs Work`.
3. Apply only missing optimizations.

## Goal

Make `ProductDetailClient.tsx` faster and smoother without removing existing features.

## Optimization Checklist

### 1. Product Data Loading
- Prevent unnecessary re-renders in `ProductDetailClient.tsx`.
- Keep product UI render independent from review loading.
- Memoize derived values (selected variant price, stock status, computed discount, etc.).
- Load only critical product data for first paint; defer secondary content.
- Avoid duplicate requests for the same product slug.

### 2. Client Rendering and State
- Split large component sections into memoized subcomponents when useful.
- Keep state localized (do not trigger parent re-renders unnecessarily).
- Use stable callbacks (`useCallback`) for frequently passed handlers.
- Use `useMemo` for expensive transformations.

### 3. Image Performance
- Keep the hero product image prioritized.
- Lazy-load non-critical gallery thumbnails and below-the-fold images.
- Ensure responsive `sizes` and efficient format delivery (for example `f_auto,q_auto` where applicable).
- Avoid layout shifts by preserving image dimensions/aspect ratio.

### 4. Review Section Performance
- Load first review page only (max 4 items), then load more on demand.
- Do not refetch all review metadata after submit.
- Refresh only review list state after successful review post.
- Keep review modal isolated so opening/typing does not rerender the whole product page.

### 5. Review Upload Flow
- Validate review text/rating/image before submit.
- Show clear loading/progress state during Cloudinary interaction and submission.
- Prevent duplicate submissions while request is in flight.
- Keep image upload optional and non-blocking for text-only reviews.

### 6. API and Backend Efficiency
- Ensure product detail endpoint returns only required fields.
- Ensure review endpoint supports pagination and limit (`4` by default).
- Add/verify indexes for:
	- Product slug
	- Review product reference
	- CreatedAt for review sorting (if used)
- Avoid N+1 patterns and repeated count queries where unnecessary.

### 7. UX Resilience
- Add lightweight skeletons/placeholders for deferred sections.
- Add graceful empty/error states for reviews.
- Add timeout/error fallback UI for slow networks.

## Constraints

- Preserve all current features:
	- Add to cart
	- Buy now
	- Variant selection
	- Review submission
	- Optional review image upload
- Prefer focused optimizations over full rewrites.
- Do not change behavior unrelated to performance.

## Expected Outcome

- Faster initial render for product details.
- Reduced client CPU/memory usage.
- Smoother interactions while switching variants and submitting reviews.
- Improved perceived performance on slower connections.
- No duplicate work on items already optimized.