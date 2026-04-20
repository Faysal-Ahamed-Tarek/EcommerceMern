# Role  
You are a senior full‑stack engineer building a production‑ready e‑commerce website from scratch.


# Project overview 
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js + Express.js, TypeScript
- **Database**: (or MongoDB + Mongoose)
- **Authentication**: JWT
- **Payment**: Cash On Delivery



The app must be **modular**, **well‑organized**, and **documented** (with clear folder structure and comments where needed). 



## STEP 2 : fronted
## 1. Home page layout

Design the home page with the following structure:

### Header (2 rows)
- **1st row (top bar)**  
  - Left: logo (link to home)  
  - Middle: search bar (search by product name or SKU; use debounced search)  
  - Right: “Support” with phone number and cart icon  
- **2nd row (navigation)**  
  - Horizontal list of categories 
  - Each category is a clickable link to the product category listing page
- Make sure **mobile responsive**


### Hero section (slider)
- Three‑image slider 
- Configurable from admin dashboard (image + CTA link)  


### Top‑notch minimal product listing with slider
  - Show products in a grid: **4 products per row** on desktop, 2 products per row on mobile
- Include “View all” button that links to full product listing page 
  - Each product card: image, title, price, “Add to cart”  
  - Each product card must be SEO‑friendly


### Reviews section
- Show customer reviews (minimal ui)
- Only show **approved reviews** (admin approval required)  


### Footer
- Columns:  
  - about company
  - just Quick links (home, about us, privacy policy, terms and conditions)  
  - Contact info (phone, email, address)  
  - Social links  
- Keep the footer minimal and aligned with the overall design  


### Smooth scroll
- Enable smooth scrolling


### Cloudinary for images
- Use **Cloudinary** for:  
  - Product images 
  - Hero/slider images (configurable from admin)   
  - Handle uploads via backend (admin form → backend → Cloudinary)  
  - Store only the **Cloudinary URL** (and optionally `public_id`) in MongoDB  
  - Ensure images are served in optimized formats (`webp` format)  
---

## 2. Product Details Page (SEO optimized)
- Create a dynamic route: `/products/[slug]`  
- Server Component (SSR/SSG) for:  
  - Product title, description, price, variants, meta tags (title, description, og:image, etc.)  


### Multiple images of product
- Support several product images per product  
- Show a thumbnail gallery with main image     


### Price change based on product variants
- Support flexible variants:  
  - Size, weight, color, etc.  
- Each variant must have its own:  
  - Title (e.g., “Small”, “500g”)  
  - Price 
- When user selects a variant, the displayed price updates accordingly  
- Variants are loaded from the backend (no hard‑coded logic)  


### Product description
- Long‑form description field (HTML or Markdown)  
- Render description safely on the frontend (sanitized HTML or Markdown renderer)  


### Product reviews and rating (admin approval required)
- After placing an order, user can submit a review + rating  
- Reviews are stored in DB with `status: pending|approved|rejected`  
- Admin must approve reviews before they appear on the product page  
- Show aggregate rating (e.g., 4.7/5) 


### Buttons:
- “Add to cart” – adds item to cart
- “Buy now” –>  checkout
- “Order on WhatsApp” -> Example: “Hi, I want to order [Product Name] (ID: …).”  
---

### Checkout (Single Page) 
- Fields:  
  - Name, phone (bd), address  
  - Selected items (name, quantity, variant, price)  
- Payment method: **Cash On Delivery**
- After placing order, redirect to a “Thank you / Order confirmation” page with order ID  
- Send order info to backend (saved in DB) and optionally notify admin via email 
---


## 3. Performance strategy

- **Use Server Components** for product pages and product listing where possible  
- **Static Generation (SSG)** for product listing (if products are not too dynamic or updated very frequently)  
- **Lazy‑load images** using `loading="lazy"` on standard `<img>` or Next.js Image with `priority` only for hero images  
- **Use Next.js Image** for:  
  - Product images  
  - Optimized width/height, responsive layout (`fill` or `responsive`)  

---

## 6. Security basics

- Zod/Joi validation
- Rate limit admin login (5/15min)
- Sanitize HTML/MD

## 7 - github
- push the code to github with a meaningful commit message after every changes of the code 
- https://github.com/Faysal-Ahamed-Tarek/EcommerceMern


## Report
Local Setup Guide