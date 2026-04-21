# Role
You are a senior full-stack engineer working on an e-commerce app.
Stack:
- Frontend: Next.js (App Router), TypeScript, Tailwind
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose)


# Objective
Implement product variant support with these exact business rules:

1. Add variant type: `weight`.
2. Variants are optional (not mandatory) for products.
3. If variants exist, each variant must have its own `price` and `discountPrice` in Admin Dashboard create/edit flows.

# Important Business Logic
- A product can be created without variants.
- If product has no variants:
	- Use product-level `basePrice` and `DiscountPrice` (existing behavior).
- If product has variants:
	- Each variant row must include:
		- `weight` (string, required for that row)
		- `price` (number, required)
		- `discountPrice` (number, required, can be 0)
		- optional `stock` (number, if stock exists in current system)
	- Product-level price fields should not be used for checkout pricing when variants are present.
	- Validation rule: `discountPrice <= price`.

# Implementation Requirements

## 1) Data Model (Backend)
- Extend Product schema to support optional variants array.
- Add a variant sub-schema/interface for `weight` pricing.
- Keep backward compatibility with products that do not have variants.

Suggested shape:
```ts
type ProductVariant = {
	weight: string;         // example: "500g", "1kg", "2kg"
	price: number;
	discountPrice: number;
	stock?: number;
};

type Product = {
	// existing fields...
	basePrice: number;
	DiscountPrice: number;
	variants?: ProductVariant[]; // optional
};
```

## 2) Validation (Backend)
- Update request validation schemas (create/update product):
	- `variants` is optional.
	- If provided, it must be a non-empty array of valid variant objects.
	- Each variant requires `weight`, `price`, `discountPrice`.
	- Enforce `discountPrice <= price`.
- Keep existing validation behavior for non-variant products.

## 3) Admin Dashboard UI
- In product create/edit forms:
	- Add a toggle: `Has Variants`.
	- If OFF:
		- Show product-level `basePrice` and `DiscountPrice` inputs (current behavior).
	- If ON:
		- Show dynamic variant table/rows for `weight`, `price`, `discountPrice` (and `stock` if applicable).
		- Allow add/remove variant rows.
		- Require all fields per row.
		- Show inline validation errors.
- Dashboard list/details should display variant pricing clearly when variants exist.

## 4) Product Details Page (Frontend)
- If product has variants:
	- Show selectable weight options.
	- Price display updates based on selected weight variant.
	- Add-to-cart uses selected variant weight + selected variant price.
- If product has no variants:
	- Keep current price display and add-to-cart logic.

## 5) Cart and Order Payload
- Include selected weight variant in cart item/order item when applicable.
- Ensure order total uses variant price when variant is selected.
- Do not break existing orders for non-variant products.

## 6) API Compatibility
- Keep existing endpoints if possible.
- Response should include `variants` when present.
- Existing products without variants must continue working with no migration break.

# Acceptance Criteria
- Can create product without variants.
- Can create product with one or more weight variants.
- Variant row requires `weight`, `price`, `discountPrice`.
- Product details page can switch weight and updates displayed price.
- Cart stores selected weight and correct price.
- Dashboard create/edit supports both modes cleanly.
- No TypeScript errors and no runtime regression in existing product flow.

# Output Format
Return:
1. A short implementation plan.
2. Exact file-by-file code changes.
3. Any migration notes (if needed).
4. Test checklist with manual test cases.





