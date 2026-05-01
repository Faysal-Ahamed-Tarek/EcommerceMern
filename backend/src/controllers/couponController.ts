import { Request, Response, NextFunction } from 'express';
import Coupon from '../models/Coupon';

export const getAllCoupons = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: coupons });
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await Coupon.findOne({ code: req.body.code });
    if (existing) {
      res.status(400).json({ success: false, message: 'Coupon code already exists' });
      return;
    }
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, data: coupon, message: 'Coupon created successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }
    res.json({ success: true, data: coupon, message: 'Coupon updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { couponCode, cartTotal, productSlugs } = req.body as {
      couponCode: string;
      cartTotal: number;
      productSlugs: string[];
    };

    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon || !coupon.isActive) {
      res.status(400).json({ success: false, message: 'Invalid or inactive coupon code' });
      return;
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      res.status(400).json({ success: false, message: 'Coupon has expired' });
      return;
    }

    if (coupon.maxUsageCount !== undefined && coupon.currentUsageCount >= coupon.maxUsageCount) {
      res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      return;
    }

    if (coupon.minOrderAmount !== undefined && cartTotal < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount of ৳${coupon.minOrderAmount} required`,
      });
      return;
    }

    if (coupon.applicableProducts.length > 0) {
      const applicable = productSlugs.some((slug) => coupon.applicableProducts.includes(slug));
      if (!applicable) {
        res.status(400).json({ success: false, message: 'Coupon is not applicable to items in your cart' });
        return;
      }
    }

    let discountAmount: number;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(coupon.discountValue, cartTotal);
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalTotal: cartTotal - discountAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};
