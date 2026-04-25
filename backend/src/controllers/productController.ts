import { Request, Response, NextFunction } from 'express';
import { Product } from '../models';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, sort, status, featured, topSelling } = req.query;
    const filter: Record<string, unknown> = { status: status || 'published' };

    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (topSelling === 'true') filter.isTopSelling = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      filter.basePrice = priceFilter;
    }

    const sortMap: Record<string, Record<string, number>> = {
      latest: { createdAt: -1 },
      price_asc: { basePrice: 1 },
      price_desc: { basePrice: -1 },
    };
    const secondarySort = sortMap[sort as string] ?? { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const basePipeline = [
      { $match: filter },
      { $addFields: { _ord: { $ifNull: ['$order', 999999] } } },
      { $sort: { _ord: 1, ...secondarySort } },
    ];

    const [products, countResult] = await Promise.all([
      Product.aggregate([
        ...basePipeline,
        { $skip: skip },
        { $limit: Number(limit) },
        { $project: { _ord: 0 } },
      ]),
      Product.aggregate([...basePipeline, { $count: 'total' }]),
    ]);

    const total = (countResult[0]?.total as number) ?? 0;

    res.json({ success: true, data: products, total, page: Number(page), limit: Number(limit) });
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
