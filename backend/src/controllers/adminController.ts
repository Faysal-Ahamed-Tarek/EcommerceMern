import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Admin, Order, Product, Review } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendPasswordResetEmail } from '../lib/mailer';

const LOGIN_MAX_ATTEMPTS = parseInt(process.env.ADMIN_LOGIN_MAX_ATTEMPTS || '5');
const LOGIN_LOCK_MINUTES = parseInt(process.env.ADMIN_LOGIN_LOCK_MINUTES || '15');

// Minimum password complexity: 8+ chars, at least one digit, one special char
const PASSWORD_STRONG = /^(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+{};:,<.>/?])(.{8,})$/;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 1000, // 1 hour
  path: '/',
};

function auditLog(event: string, data: Record<string, unknown>) {
  console.info(JSON.stringify({ event, timestamp: new Date().toISOString(), ...data }));
}

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });

    // Account lockout check
    if (admin?.isLocked()) {
      auditLog('login_failed', { email, ip, ua, reason: 'account_locked' });
      res.status(423).json({ success: false, message: 'Account temporarily locked. Please try again later.' });
      return;
    }

    const passwordOk = admin ? await admin.comparePassword(password) : false;

    if (!admin || !passwordOk) {
      if (admin) {
        admin.loginAttempts += 1;
        if (admin.loginAttempts >= LOGIN_MAX_ATTEMPTS) {
          admin.lockUntil = new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000);
        }
        await admin.save();
      }
      auditLog('login_failed', { email, ip, ua });
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Reset lockout on success
    if (admin.loginAttempts > 0 || admin.lockUntil) {
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save();
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'],
    });

    res.cookie('adminToken', token, COOKIE_OPTS);
    auditLog('login_success', { adminId: admin._id, email: admin.email, ip, ua });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const adminLogout = (req: AuthRequest, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  auditLog('logout', { adminId: req.adminId, ip });
  res.clearCookie('adminToken', { path: '/' });
  res.json({ success: true });
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'New passwords do not match' });
      return;
    }
    if (!PASSWORD_STRONG.test(newPassword)) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters and include a number and special character' });
      return;
    }

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin not found' });
      return;
    }

    const currentOk = await admin.comparePassword(currentPassword);
    if (!currentOk) {
      auditLog('password_change_failed', { adminId: admin._id, ip, ua, reason: 'wrong_current_password' });
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    // Prevent reuse of current password
    const sameAsOld = await admin.comparePassword(newPassword);
    if (sameAsOld) {
      res.status(400).json({ success: false, message: 'New password must be different from the current password' });
      return;
    }

    admin.password = newPassword;
    admin.passwordChangedAt = new Date();
    await admin.save();

    // Invalidate session by clearing cookie
    res.clearCookie('adminToken', { path: '/' });
    auditLog('password_change_success', { adminId: admin._id, email: admin.email, ip, ua });
    res.json({ success: true, message: 'Password changed. Please log in again.' });
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
      .select('title_en title_bn totalStock images slug')
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
    const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(500).lean();
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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    // Always respond with success so we don't reveal whether email exists
    const GENERIC_OK = { success: true, message: 'If that email is registered, a reset link has been sent.' };

    if (!email) { res.json(GENERIC_OK); return; }

    const admin = await Admin.findOne({ email });
    if (!admin) { res.json(GENERIC_OK); return; }

    // Generate a secure random token; store its SHA-256 hash in DB
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    admin.resetPasswordToken = hashed;
    admin.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await admin.save();

    const baseUrl = process.env.ADMIN_ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(admin.email, resetUrl);
    auditLog('password_reset_requested', { email: admin.email, ip: req.ip || 'unknown' });

    res.json(GENERIC_OK);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match' });
      return;
    }
    if (!PASSWORD_STRONG.test(newPassword)) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters and include a number and special character' });
      return;
    }

    const hashed = crypto.createHash('sha256').update(String(token)).digest('hex');
    const admin = await Admin.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!admin) {
      res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
      return;
    }

    admin.password = newPassword;
    admin.passwordChangedAt = new Date();
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    res.clearCookie('adminToken', { path: '/' });
    auditLog('password_reset_success', { adminId: admin._id, email: admin.email, ip: req.ip || 'unknown' });
    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (err) {
    next(err);
  }
};
