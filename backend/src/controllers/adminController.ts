import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin, Order, Product, Review } from '../models';
import { AuthRequest } from '../middleware/auth';

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
    });

    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password').lean();
    res.json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalOrders, pendingOrders, totalProducts, pendingReviews, activeProducts] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
      Product.countDocuments({ status: 'published' }),
    ]);
    res.json({ success: true, data: { totalOrders, pendingOrders, totalProducts, pendingReviews, activeProducts } });
  } catch (err) {
    next(err);
  }
};

export const getLowInventoryProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({
      status: 'published',
      totalStock: { $exists: true, $ne: null, $lt: 20 },
    })
      .sort({ totalStock: 1 })
      .limit(5)
      .select('title totalStock images slug')
      .lean();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

export const getTopSellingProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const topSlugs: { _id: string; title: string; totalQty: number }[] = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productSlug', title: { $first: '$items.title' }, image: { $first: '$items.image' }, totalQty: { $sum: '$items.quantity' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);
    res.json({ success: true, data: topSlugs });
  } catch (err) {
    next(err);
  }
};

export const getAdminProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const getAdminProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const getAllAdminReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') filter.status = status;
    const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};
