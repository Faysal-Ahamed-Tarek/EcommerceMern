import 'dotenv/config';
import mongoose from 'mongoose';
import { Product, Category, Review } from '../models';
import HomeReview from '../models/HomeReview';

const MONGO_URI = process.env.MONGODB_URI as string;

async function cleanse() {
  if (!MONGO_URI) {
    console.error('❌ MONGODB_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const [products, reviews, categories, homeReviews] = await Promise.all([
    Product.deleteMany({}),
    Review.deleteMany({}),
    Category.deleteMany({}),
    HomeReview.deleteMany({}),
  ]);

  console.log(`🗑  Products deleted:     ${products.deletedCount}`);
  console.log(`🗑  Reviews deleted:      ${reviews.deletedCount}`);
  console.log(`🗑  Categories deleted:   ${categories.deletedCount}`);
  console.log(`🗑  Home reviews deleted: ${homeReviews.deletedCount}`);
  console.log('\n✅ Demo data removed. Database is clean for real content.');

  await mongoose.disconnect();
}

cleanse().catch((err) => {
  console.error('❌ Cleanse failed:', err);
  process.exit(1);
});
