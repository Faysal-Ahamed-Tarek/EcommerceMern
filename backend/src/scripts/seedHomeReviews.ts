import 'dotenv/config';
import mongoose from 'mongoose';
import HomeReview from '../models/HomeReview';

const MONGO_URI = process.env.MONGODB_URI as string;

const REVIEWS = [
  {
    customerName: 'Nusrat Jahan',
    rating: 5,
    comment: 'Absolutely love this store! The products are genuine and delivery was super fast. Will definitely order again.',
    isVerified: true,
    isActive: true,
    order: 1,
  },
  {
    customerName: 'Rakib Hossain',
    rating: 5,
    comment: 'Best online shopping experience in Bangladesh. Quality products, great packaging and on-time delivery.',
    isVerified: true,
    isActive: true,
    order: 2,
  },
  {
    customerName: 'Sumaiya Khanam',
    rating: 4,
    comment: 'Very happy with my purchase. The skincare products are exactly as described. Customer service is also very helpful.',
    isVerified: true,
    isActive: true,
    order: 3,
  },
  {
    customerName: 'Tanvir Ahmed',
    rating: 5,
    comment: 'Got my order within 2 days! The product quality is top notch. Highly recommend to everyone.',
    isVerified: false,
    isActive: true,
    order: 4,
  },
  {
    customerName: 'Farzana Begum',
    rating: 4,
    comment: 'Great collection and reasonable prices. The organic honey I ordered was 100% pure. Will be a regular customer.',
    isVerified: true,
    isActive: true,
    order: 5,
  },
  {
    customerName: 'Arif Khan',
    rating: 5,
    comment: 'Ordered electronics and fashion items together. Both arrived in perfect condition with excellent packaging.',
    isVerified: true,
    isActive: true,
    order: 6,
  },
  {
    customerName: 'Reshma Begum',
    rating: 5,
    comment: 'The face cream I ordered worked wonders for my skin. Totally authentic product. Thank you ShopBD!',
    isVerified: true,
    isActive: true,
    order: 7,
  },
  {
    customerName: 'Mehedi Hasan',
    rating: 4,
    comment: 'Really impressed with the product variety. Found everything I needed in one place. Smooth checkout process too.',
    isVerified: false,
    isActive: true,
    order: 8,
  },
  {
    customerName: 'Tasnim Akter',
    rating: 5,
    comment: 'Cash on delivery made it so easy to order. Product matched the photos exactly. Very satisfied customer!',
    isVerified: true,
    isActive: true,
    order: 9,
  },
  {
    customerName: 'Sabbir Rahman',
    rating: 5,
    comment: 'Amazing service! The smartwatch I bought is working perfectly. Great value for money. 5 stars!',
    isVerified: true,
    isActive: true,
    order: 10,
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const existing = await HomeReview.countDocuments();
  if (existing > 0) {
    console.log(`⏭  ${existing} home reviews already exist — skipping`);
    await mongoose.disconnect();
    return;
  }

  await HomeReview.insertMany(REVIEWS);
  console.log(`✅ ${REVIEWS.length} home reviews seeded`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
