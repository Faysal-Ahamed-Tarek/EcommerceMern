import { Request, Response, NextFunction } from 'express';
import HeroSlide from '../models/HeroSlide';

export const getActiveSlides = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 }).lean();
    res.json({ success: true, data: slides });
  } catch (err) {
    next(err);
  }
};

export const getAllSlides = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 }).lean();
    res.json({ success: true, data: slides });
  } catch (err) {
    next(err);
  }
};

export const createSlide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slide = await HeroSlide.create(req.body);
    res.status(201).json({ success: true, data: slide });
  } catch (err) {
    next(err);
  }
};

export const updateSlide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!slide) {
      res.status(404).json({ success: false, message: 'Slide not found' });
      return;
    }
    res.json({ success: true, data: slide });
  } catch (err) {
    next(err);
  }
};

export const deleteSlide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await HeroSlide.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Slide deleted' });
  } catch (err) {
    next(err);
  }
};
