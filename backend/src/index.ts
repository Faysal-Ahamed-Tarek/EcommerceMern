import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './lib/db';
import { errorHandler } from './middleware/errorHandler';
import { Product } from './models';

import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';
import { getActiveSlides } from './controllers/heroSlideController';
import { getConfig } from './controllers/siteConfigController';
import { getPromoPanel } from './controllers/promoPanelController';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/slides', getActiveSlides);
app.get('/api/config', getConfig);
app.get('/api/promo-panel', getPromoPanel);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
