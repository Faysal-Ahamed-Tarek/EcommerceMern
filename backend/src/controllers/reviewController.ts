import { Request, Response, NextFunction } from 'express';
import { Review, Product } from '../models';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const getApprovedReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({
      productSlug: req.params.slug,
      status: 'approved',
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const getPendingReviews = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const updateReviewStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    if (status === 'approved') {
      const result = await Review.aggregate([
        { $match: { productSlug: review.productSlug, status: 'approved' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (result.length > 0) {
        await Product.updateOne(
          { slug: review.productSlug },
          {
            ratingAverage: Math.round(result[0].avg * 10) / 10,
            ratingCount: result[0].count,
          }
        );
      }
    }

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerName, rating, comment, imageUrl, status } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { customerName, rating, comment, imageUrl, status },
      { new: true, runValidators: true }
    ).lean();
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }
    const result = await Review.aggregate([
      { $match: { productSlug: review.productSlug, status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (result.length > 0) {
      await Product.updateOne(
        { slug: review.productSlug },
        { ratingAverage: Math.round(result[0].avg * 10) / 10, ratingCount: result[0].count }
      );
    }
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const adminCreateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.create({ ...req.body, status: req.body.status ?? 'approved' });
    if (review.status === 'approved') {
      const result = await Review.aggregate([
        { $match: { productSlug: review.productSlug, status: 'approved' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (result.length > 0) {
        await Product.updateOne(
          { slug: review.productSlug },
          { ratingAverage: Math.round(result[0].avg * 10) / 10, ratingCount: result[0].count }
        );
      }
    }
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};
