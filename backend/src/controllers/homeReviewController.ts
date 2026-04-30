import { Request, Response, NextFunction } from 'express';
import HomeReview from '../models/HomeReview';

export const getActiveHomeReviews = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await HomeReview.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const getAllHomeReviews = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await HomeReview.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const createHomeReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await HomeReview.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const updateHomeReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await HomeReview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const deleteHomeReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await HomeReview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
