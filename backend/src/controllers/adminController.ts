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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalOrders, pendingOrders, ordersToday, totalProducts, pendingReviews, activeProducts, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Product.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
      Product.countDocuments({ status: 'published' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue: number = revenueAgg[0]?.total ?? 0;
    res.json({ success: true, data: { totalOrders, pendingOrders, ordersToday, totalProducts, pendingReviews, activeProducts, totalRevenue } });
  } catch (err) {
    next(err);
  }
};

export const getLowInventoryProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({
      status: 'published',
      totalStock: { $exists: true, $ne: null, $lt: 10 },
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

export const getRevenueChart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || 'daily';
    const now = new Date();
    let groupId: Record<string, unknown>;
    let startDate: Date;
    let points: number;

    if (period === 'monthly') {
      points = 12;
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    } else if (period === 'weekly') {
      points = 8;
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7 * (points - 1));
      startDate.setHours(0, 0, 0, 0);
      groupId = { year: { $isoWeekYear: '$createdAt' }, week: { $isoWeek: '$createdAt' } };
    } else {
      // daily — last 7 days
      points = 7;
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (points - 1));
      startDate.setHours(0, 0, 0, 0);
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    }

    const raw: { _id: Record<string, number>; revenue: number; orders: number }[] = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: groupId, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    // Build a full series of labels + fill zeros
    const series: { label: string; revenue: number; orders: number }[] = [];
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(now);
      if (period === 'daily') {
        d.setDate(d.getDate() - i);
        const key = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
        const match = raw.find((r) => r._id.year === key.year && r._id.month === key.month && r._id.day === key.day);
        series.push({ label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), revenue: match?.revenue ?? 0, orders: match?.orders ?? 0 });
      } else if (period === 'weekly') {
        d.setDate(d.getDate() - i * 7);
        // ISO week number
        const jan4 = new Date(d.getFullYear(), 0, 4);
        const weekNum = Math.ceil(((d.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7);
        const match = raw.find((r) => r._id.year === d.getFullYear() && r._id.week === weekNum);
        series.push({ label: `W${weekNum}`, revenue: match?.revenue ?? 0, orders: match?.orders ?? 0 });
      } else {
        d.setMonth(d.getMonth() - i);
        const key = { year: d.getFullYear(), month: d.getMonth() + 1 };
        const match = raw.find((r) => r._id.year === key.year && r._id.month === key.month);
        series.push({ label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), revenue: match?.revenue ?? 0, orders: match?.orders ?? 0 });
      }
    }

    res.json({ success: true, data: series });
  } catch (err) {
    next(err);
  }
};

export const getNotificationCounts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [pendingOrders, pendingReviews] = await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Review.countDocuments({ status: 'pending' }),
    ]);
    res.json({ success: true, data: { pendingOrders, pendingReviews } });
  } catch (err) {
    next(err);
  }
};
