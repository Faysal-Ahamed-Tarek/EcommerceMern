import 'dotenv/config';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import connectDB from './lib/db';
import { errorHandler } from './middleware/errorHandler';
import { Product } from './models';

import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';
import homeReviewRoutes from './routes/homeReviewRoutes';
import seoRoutes from './routes/seoRoutes';
import couponRoutes from './routes/couponRoutes';
import { getActiveSlides } from './controllers/heroSlideController';
import { getConfig } from './controllers/siteConfigController';
import { getPromoPanel } from './controllers/promoPanelController';
import { getStaticPage } from './controllers/staticPageController';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Nginx as the first proxy so rate-limiting sees real client IPs
app.set('trust proxy', 1);

app.use(compression());
app.use(helmet());
app.use(cors({
  origin: (process.env.ADMIN_ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/home-reviews', homeReviewRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/slides', getActiveSlides);
app.get('/api/config', getConfig);
app.get('/api/promo-panel', getPromoPanel);
app.get('/api/pages/:slug', getStaticPage);
app.use('/api/seo', seoRoutes);
app.use('/api/coupons', couponRoutes);

app.get('/health', (_req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const db = mongoose.connection.readyState;
  const status = db === 1 ? 'ok' : 'degraded';
  res.status(db === 1 ? 200 : 503).json({
    status,
    db: dbState[db] ?? 'unknown',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

const start = async () => {
  await connectDB();
  // Drop stale sku_1 unique index left over from an older schema version
  await Product.collection.dropIndex('sku_1').catch(() => {});
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
