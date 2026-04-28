# Project Brief

You are working on a React / Next.js e-commerce frontend that uses Tailwind CSS. Focus on production bugs and UX fixes. Make the smallest correct change possible, keep the existing design language, and avoid unrelated refactors.

## Working Rules
- Prioritize correctness over cosmetic changes.
- Fix the root cause, not just the visible symptom.
- Keep changes minimal and easy to review.
- When a fix affects behavior, verify the result in the relevant page or component.
- Do not change unrelated features while working on a task.

## Priority Tasks

### 1. Category filtering bug
Fix the category product listing/filtering issue where categories do not display products on the frontend.

Observed behavior:
- A category such as `new-mal` can have products assigned in the backend, but the frontend shows no products.
- Filtering by that category on the products page also returns no results.


Expected behavior:
- Any category with products should display them correctly on its category page.
- The products page filter should return the same category products.


### 2. Remove marquee sliding effect
Disable the sliding/marquee text animation.

Expected behavior:
- The text should render normally without horizontal sliding.
- Keep the content visible and readable.
- Prefer a simple static presentation over animation.

### 3. Fix product ordering on the products page
Make the `/products` listing order consistent and predictable.

Expected behavior:
- Products with an explicit order value should be shown according to that order.
- Products without an order value should be shown in random order.
- You may add temporary dummy ordering data if needed to confirm the behavior.

### 4. Hero slider link behavior
Make the homepage hero slider image clickable.

Expected behavior:
- Clicking the hero image should navigate to the configured link.
- The entire image area should behave like the link, not just a small overlay.

### 5. Add scroll-to-top button
Add a button that lets users jump back to the top of the page.

Expected behavior:
- The button should be easy to find but not intrusive.
- It should work on long pages and feel responsive on mobile and desktop.

### 6. Update the header navigation
Improve the right side of the header and add a Shop link.

Expected behavior:
- Add a `Shop` item linking to `http://localhost:3000/products`.
- Place it on the right side of the header with an icon.
- Make the right-side header items visually consistent in font weight and color.
- Ensure the header remains polished and responsive on mobile.

## Output Expectations
- Implement the fixes directly in the codebase.
- Keep the UI clean and professional.
- Validate the touched files if a reliable check is available.