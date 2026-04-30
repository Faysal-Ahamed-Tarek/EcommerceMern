import 'dotenv/config';
import mongoose from 'mongoose';
import { Product, Category, Review } from '../models';

const MONGO_URI = process.env.MONGODB_URI as string;

const CATEGORIES = [
  { name: 'Skincare', slug: 'skincare' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Food & Grocery', slug: 'food-grocery' },
];

const PRODUCTS = [
  {
    title: 'Organic Face Cream',
    description: 'A nourishing organic face cream made with natural ingredients. Deeply moisturizes and rejuvenates skin for a youthful glow.',
    shortDescription: 'Natural moisturizing face cream for all skin types.',
    category: 'Skincare',
    basePrice: 650,
    DiscountPrice: 499,
    totalStock: 120,
    isFeatured: true,
    isTopSelling: true,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', publicId: 'face-cream' }],
    variants: [],
    reviews: [
      { customerName: 'Priya Das', rating: 5, comment: 'Amazing product! My skin feels so soft and hydrated after just one week of use.' },
      { customerName: 'Rina Akter', rating: 4, comment: 'Good quality face cream, natural scent. Will definitely buy again.' },
      { customerName: 'Sadia Islam', rating: 5, comment: 'Best face cream I have ever used. Highly recommended!' },
    ],
  },
  {
    title: 'Vitamin C Serum',
    description: 'Brightening vitamin C serum that fades dark spots and evens skin tone. Lightweight formula absorbs quickly.',
    shortDescription: 'Brightening serum with 20% vitamin C.',
    category: 'Skincare',
    basePrice: 890,
    DiscountPrice: 720,
    totalStock: 85,
    isFeatured: true,
    isTopSelling: false,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', publicId: 'vitamin-c-serum' }],
    variants: [],
    reviews: [
      { customerName: 'Nusrat Jahan', rating: 5, comment: 'Noticed visible brightening after 2 weeks. Love it!' },
      { customerName: 'Farzana Begum', rating: 4, comment: 'Good serum but takes time to show results. Patience pays off.' },
      { customerName: 'Mitu Roy', rating: 5, comment: 'My dark spots have faded significantly. Great product!' },
      { customerName: 'Shila Akter', rating: 4, comment: 'Nice texture, absorbs fast. Happy with the purchase.' },
    ],
  },
  {
    title: 'Wireless Bluetooth Earbuds',
    description: 'True wireless earbuds with active noise cancellation, 30-hour battery life, and premium sound quality. Waterproof design.',
    shortDescription: 'ANC earbuds with 30hr battery life.',
    category: 'Electronics',
    basePrice: 3500,
    DiscountPrice: 2800,
    totalStock: 45,
    isFeatured: true,
    isTopSelling: true,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', publicId: 'earbuds' }],
    variants: [
      { type: 'color', name: 'Black', price: 2800, discountPrice: 0, stock: 25 },
      { type: 'color', name: 'White', price: 2800, discountPrice: 0, stock: 20 },
    ],
    reviews: [
      { customerName: 'Rakib Hossain', rating: 5, comment: 'Excellent sound quality and the ANC works great. Battery lasts all day!' },
      { customerName: 'Tanvir Ahmed', rating: 4, comment: 'Good earbuds for the price. Comfortable fit for long sessions.' },
      { customerName: 'Sumon Mia', rating: 5, comment: 'Best purchase this year! Sound is crystal clear.' },
    ],
  },
  {
    title: 'Smart Watch Pro',
    description: 'Feature-packed smartwatch with health monitoring, GPS, 7-day battery, and 50+ sport modes. Compatible with iOS and Android.',
    shortDescription: 'Health & fitness smartwatch with GPS.',
    category: 'Electronics',
    basePrice: 8500,
    DiscountPrice: 6999,
    totalStock: 30,
    isFeatured: false,
    isTopSelling: true,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', publicId: 'smartwatch' }],
    variants: [
      { type: 'size', name: '42mm', price: 6999, discountPrice: 0, stock: 15 },
      { type: 'size', name: '46mm', price: 7499, discountPrice: 0, stock: 15 },
    ],
    reviews: [
      { customerName: 'Arif Khan', rating: 5, comment: 'Tracks everything I need. Heart rate, steps, sleep — all accurate.' },
      { customerName: 'Sabbir Rahman', rating: 4, comment: 'Good build quality, battery lasts almost a week on regular use.' },
      { customerName: 'Masud Rana', rating: 5, comment: 'Amazing value for money. Looks premium too.' },
      { customerName: 'Imran Hossain', rating: 3, comment: 'Good watch but the companion app could be improved.' },
    ],
  },
  {
    title: 'Men\'s Classic Polo Shirt',
    description: 'Premium cotton polo shirt for men. Breathable, comfortable, and stylish for casual and semi-formal occasions.',
    shortDescription: 'Classic fit premium cotton polo.',
    category: 'Fashion',
    basePrice: 750,
    DiscountPrice: 599,
    totalStock: 200,
    isFeatured: false,
    isTopSelling: true,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400', publicId: 'polo-shirt' }],
    variants: [
      { type: 'size', name: 'S', price: 599, discountPrice: 0, stock: 50 },
      { type: 'size', name: 'M', price: 599, discountPrice: 0, stock: 70 },
      { type: 'size', name: 'L', price: 599, discountPrice: 0, stock: 50 },
      { type: 'size', name: 'XL', price: 599, discountPrice: 0, stock: 30 },
    ],
    reviews: [
      { customerName: 'Mehedi Hasan', rating: 5, comment: 'Perfect fit and great fabric quality. Very comfortable.' },
      { customerName: 'Farhan Ali', rating: 4, comment: 'Good quality polo. Color is exactly as shown.' },
      { customerName: 'Nayeem Islam', rating: 5, comment: 'Bought 3 pieces! Great value for the price.' },
    ],
  },
  {
    title: 'Women\'s Floral Kurti',
    description: 'Elegant floral printed kurti made from soft rayon fabric. Perfect for festive and casual wear. Available in multiple sizes.',
    shortDescription: 'Soft rayon floral kurti for women.',
    category: 'Fashion',
    basePrice: 850,
    DiscountPrice: 650,
    totalStock: 150,
    isFeatured: true,
    isTopSelling: false,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', publicId: 'kurti' }],
    variants: [
      { type: 'size', name: 'S', price: 650, discountPrice: 0, stock: 40 },
      { type: 'size', name: 'M', price: 650, discountPrice: 0, stock: 60 },
      { type: 'size', name: 'L', price: 650, discountPrice: 0, stock: 30 },
      { type: 'size', name: 'XL', price: 650, discountPrice: 0, stock: 20 },
    ],
    reviews: [
      { customerName: 'Sumaiya Khanam', rating: 5, comment: 'Beautiful kurti! The fabric is so soft and the print is gorgeous.' },
      { customerName: 'Tasnim Akter', rating: 5, comment: 'Perfect fit and great quality. Got many compliments!' },
      { customerName: 'Reshma Begum', rating: 4, comment: 'Nice kurti, color is slightly lighter than the photo but still pretty.' },
    ],
  },
  {
    title: 'Organic Honey (500g)',
    description: 'Pure raw organic honey sourced directly from Sundarbans. No preservatives, no additives. Rich in antioxidants and natural enzymes.',
    shortDescription: 'Raw Sundarbans forest honey, 500g.',
    category: 'Food & Grocery',
    basePrice: 580,
    DiscountPrice: 499,
    totalStock: 300,
    isFeatured: false,
    isTopSelling: true,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=400', publicId: 'honey' }],
    variants: [],
    reviews: [
      { customerName: 'Hafizur Rahman', rating: 5, comment: 'Genuine Sundarbans honey! Taste is authentic and rich. Will order more.' },
      { customerName: 'Kamal Uddin', rating: 5, comment: 'Best honey I have had. Pure and natural flavor.' },
      { customerName: 'Jahangir Alam', rating: 4, comment: 'Good quality honey. Packaging was secure and delivery was fast.' },
      { customerName: 'Belal Hossain', rating: 5, comment: 'My family loves this honey. Buying monthly now!' },
    ],
  },
  {
    title: 'Cold Pressed Mustard Oil (1L)',
    description: 'Traditional cold pressed mustard oil, free from chemicals and preservatives. Ideal for cooking and hair care.',
    shortDescription: 'Pure cold pressed mustard oil, 1 litre.',
    category: 'Food & Grocery',
    basePrice: 320,
    DiscountPrice: 0,
    totalStock: 500,
    isFeatured: false,
    isTopSelling: false,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', publicId: 'mustard-oil' }],
    variants: [],
    reviews: [
      { customerName: 'Selim Miah', rating: 5, comment: 'Authentic mustard oil, smells just like the traditional one. Great for cooking.' },
      { customerName: 'Abul Kashem', rating: 4, comment: 'Good quality oil. Packaging could be improved but product is excellent.' },
      { customerName: 'Rabiul Islam', rating: 5, comment: 'Pure and natural taste. Will keep buying from here.' },
    ],
  },
  {
    title: 'Sunscreen SPF 50+ (100ml)',
    description: 'Broad spectrum SPF 50+ sunscreen that protects against UVA and UVB rays. Lightweight, non-greasy formula suitable for daily use.',
    shortDescription: 'Lightweight SPF 50+ daily sunscreen.',
    category: 'Skincare',
    basePrice: 480,
    DiscountPrice: 399,
    totalStock: 90,
    isFeatured: true,
    isTopSelling: false,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400', publicId: 'sunscreen' }],
    variants: [],
    reviews: [
      { customerName: 'Zakia Sultana', rating: 5, comment: 'Non-greasy formula is a game changer! Wears well under makeup.' },
      { customerName: 'Nahid Parveen', rating: 4, comment: 'Good sunscreen, no white cast. Happy with this purchase.' },
      { customerName: 'Rumi Akter', rating: 5, comment: 'Finally a sunscreen that doesn\'t feel heavy. Highly recommend!' },
    ],
  },
  {
    title: 'USB-C Fast Charger 65W',
    description: 'Universal 65W GaN USB-C fast charger. Charges laptops, phones, and tablets simultaneously. Compact travel-friendly design.',
    shortDescription: '65W GaN multi-device fast charger.',
    category: 'Electronics',
    basePrice: 1800,
    DiscountPrice: 1499,
    totalStock: 60,
    isFeatured: false,
    isTopSelling: false,
    status: 'published' as const,
    images: [{ cloudinaryUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', publicId: 'usb-charger' }],
    variants: [],
    reviews: [
      { customerName: 'Mizanur Rahman', rating: 5, comment: 'Charges my laptop and phone at the same time. Compact and powerful!' },
      { customerName: 'Shahriar Kabir', rating: 4, comment: 'Fast charging works as advertised. Good build quality.' },
      { customerName: 'Torikul Islam', rating: 5, comment: 'Best charger upgrade I have made. No more carrying multiple chargers.' },
      { customerName: 'Naim Uddin', rating: 4, comment: 'Works great. Gets slightly warm under heavy load but nothing concerning.' },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Upsert categories
  const catMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      catMap[cat.name] = cat.name;
      console.log(`  ⏭  Category "${cat.name}" already exists`);
    } else {
      const created = await Category.create(cat);
      catMap[cat.name] = created.name;
      console.log(`  ✅ Category "${cat.name}" created`);
    }
  }

  let productCount = 0;
  let reviewCount = 0;

  for (const item of PRODUCTS) {
    const { reviews: reviewData, ...productData } = item;

    const existing = await Product.findOne({ title: productData.title });
    if (existing) {
      console.log(`  ⏭  Product "${productData.title}" already exists`);
      continue;
    }

    const product = await Product.create(productData);
    productCount++;
    console.log(`  ✅ Product "${product.title}" (slug: ${product.slug})`);

    // Create reviews for this product
    for (const rv of reviewData) {
      await Review.create({
        productSlug: product.slug,
        customerName: rv.customerName,
        rating: rv.rating,
        comment: rv.comment,
        status: 'approved',
        isVerifiedPurchase: true,
      });
      reviewCount++;
    }

    // Update product rating stats
    const allReviews = reviewData;
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(product._id, {
      ratingAverage: Math.round(avg * 10) / 10,
      ratingCount: allReviews.length,
    });
  }

  console.log(`\n🎉 Seeding complete: ${productCount} products, ${reviewCount} reviews created`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
