import { Request, Response, NextFunction } from 'express';
import { Product, Category } from '../models';

// ── Lightweight in-memory cache (no Redis dependency required) ──────────────
const _cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_MAX = 60;

function cacheGet(key: string): unknown | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { _cache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key: string, data: unknown, ttlSeconds: number) {
  if (_cache.size >= CACHE_MAX) {
    const oldest = _cache.keys().next().value;
    if (oldest) _cache.delete(oldest);
  }
  _cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}
// ───────────────────────────────────────────────────────────────────────────

// Fields returned for product listing (detail page fetches full doc via slug)
const LISTING_PROJECTION = {
  _id: 1,
  title: 1,
  slug: 1,
  basePrice: 1,
  DiscountPrice: 1,
  images: { $slice: ['$images', 1] },
  variants: 1,
  ratingAverage: 1,
  ratingCount: 1,
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, sort, status, featured, topSelling } = req.query;

    // Cache key derived from the full query string (normalized)
    const cacheKey = `products:${new URLSearchParams(req.query as Record<string, string>).toString()}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    const filter: Record<string, unknown> = { status: status || 'published' };

    if (category) {
      const cat = await Category.findOne({ slug: String(category) }).lean();
      filter.category = cat ? cat.name : String(category);
    }
    if (featured === 'true') filter.isFeatured = true;
    if (topSelling === 'true') filter.isTopSelling = true;
    if (search) {
      // Escape regex metacharacters to prevent ReDoS.
      const safeSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      filter.basePrice = priceFilter;
    }

    const isLatest = !sort || sort === 'latest';
    const sortMap: Record<string, Record<string, number>> = {
      latest: { _rand: 1 },
      price_asc: { basePrice: 1 },
      price_desc: { basePrice: -1 },
    };
    const secondarySort = sortMap[sort as string] ?? { _rand: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    // Only compute $rand for "latest" — skip it for price-sorted queries.
    const addFieldsStage = isLatest
      ? { $addFields: { _ord: { $ifNull: ['$order', 999999] }, _rand: { $rand: {} } } }
      : { $addFields: { _ord: { $ifNull: ['$order', 999999] } } };

    const [products, total] = await Promise.all([
      Product.aggregate([
        { $match: filter },
        addFieldsStage,
        { $sort: { _ord: 1, ...secondarySort } as Record<string, 1 | -1> },
        { $skip: skip },
        { $limit: Number(limit) },
        { $project: LISTING_PROJECTION },
      ]),
      // countDocuments hits an index directly — no sort/addFields overhead.
      Product.countDocuments(filter),
    ]);

    // Cache listing responses; shorter TTL for search/filtered queries.
    const hasSearch = !!(search || minPrice || maxPrice);
    const ttl = hasSearch ? 60 : 300;
    res.set('Cache-Control', hasSearch ? 'private, max-age=60' : 'public, max-age=300');
    res.set('X-Cache', 'MISS');

    const payload = { success: true, data: products, total, page: Number(page), limit: Number(limit) };
    cacheSet(cacheKey, payload, ttl);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'published' }).lean();
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// Returns [{category, products[]}] for multiple slugs in one DB round-trip,
// replacing the per-slug fan-out on the homepage.
export const getCarouselSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugsParam = String(req.query.slugs || '');
    const limit = Math.min(Number(req.query.limit) || 8, 20);

    if (!slugsParam) {
      res.json({ success: true, data: [] });
      return;
    }

    const slugs = slugsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6);

    const categories = await Category.find({ slug: { $in: slugs } }).lean();
    if (!categories.length) {
      res.json({ success: true, data: [] });
      return;
    }

    const categoryNames = categories.map((c) => c.name);

    const grouped = await Product.aggregate([
      { $match: { status: 'published', category: { $in: categoryNames } } },
      { $addFields: { _ord: { $ifNull: ['$order', 999999] }, _rand: { $rand: {} } } },
      { $sort: { _ord: 1, _rand: 1 } as Record<string, 1 | -1> },
      { $project: { _ord: 0, _rand: 0 } },
      { $group: { _id: '$category', products: { $push: '$$ROOT' } } },
      { $project: { products: { $slice: ['$products', limit] } } },
    ]);

    const byName = new Map<string, unknown[]>(
      grouped.map((g) => [g._id as string, g.products as unknown[]])
    );

    const data = slugs
      .map((slug) => {
        const cat = categories.find((c) => c.slug === slug);
        if (!cat) return null;
        const products = byName.get(cat.name) ?? [];
        if (!products.length) return null;
        return { category: cat, products };
      })
      .filter(Boolean);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
