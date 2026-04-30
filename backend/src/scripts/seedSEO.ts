import 'dotenv/config';
import connectDB from '../lib/db';
import SEO from '../models/SEO';

const defaults = [
  {
    page: 'homepage',
    title: 'Best Online Shopping in Bangladesh | ShopBD',
    description: 'Discover premium products with fast delivery across Bangladesh. Shop electronics, fashion, home & more at ShopBD.',
    canonicalUrl: 'https://shopbd.com',
    ogImage: 'https://shopbd.com/og-banner.png',
    keywords: 'online shopping, Bangladesh, ecommerce, best prices',
  },
  {
    page: 'all_products',
    title: 'All Products | ShopBD',
    description: 'Browse our complete collection of quality products. Find the best deals on electronics, fashion, home, and more.',
    canonicalUrl: 'https://shopbd.com/products',
    ogImage: 'https://shopbd.com/og-products.png',
    keywords: 'products, online store, Bangladesh',
  },
  {
    page: 'about',
    title: 'About Us | ShopBD',
    description: 'Learn about ShopBD – your trusted online shopping destination in Bangladesh. Our mission, team, and story.',
    canonicalUrl: 'https://shopbd.com/about',
    ogImage: 'https://shopbd.com/og-about.png',
    keywords: 'about ShopBD, our team, mission',
  },
  {
    page: 'privacy_policy',
    title: 'Privacy Policy | ShopBD',
    description: 'Read ShopBD\'s privacy policy to understand how we collect, use, and protect your personal information.',
    canonicalUrl: 'https://shopbd.com/privacy-policy',
    ogImage: '',
    keywords: 'privacy policy, data protection',
  },
  {
    page: 'terms_conditions',
    title: 'Terms & Conditions | ShopBD',
    description: 'Review the terms and conditions that govern your use of ShopBD\'s website and services.',
    canonicalUrl: 'https://shopbd.com/terms',
    ogImage: '',
    keywords: 'terms and conditions, user agreement',
  },
] as const;

async function seed() {
  await connectDB();
  for (const data of defaults) {
    await SEO.findOneAndUpdate({ page: data.page }, data, { upsert: true, new: true });
    console.log(`Seeded SEO for: ${data.page}`);
  }
  console.log('SEO seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
