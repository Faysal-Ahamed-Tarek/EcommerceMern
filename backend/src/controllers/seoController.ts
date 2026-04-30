import { Request, Response, NextFunction } from 'express';
import SEO from '../models/SEO';

const VALID_PAGES = ['homepage', 'all_products', 'about', 'privacy_policy', 'terms_conditions'] as const;
type PageEnum = (typeof VALID_PAGES)[number];

export const getSEO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.params.page as PageEnum;
    if (!VALID_PAGES.includes(page)) {
      res.status(400).json({ success: false, message: 'Invalid page' });
      return;
    }
    const data = await SEO.findOne({ page }).lean();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createOrUpdateSEO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.params.page as PageEnum;
    if (!VALID_PAGES.includes(page)) {
      res.status(400).json({ success: false, message: 'Invalid page' });
      return;
    }
    const updated = await SEO.findOneAndUpdate(
      { page },
      { ...req.body, page },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    res.json({ success: true, data: updated, message: 'SEO updated successfully' });
  } catch (err) {
    next(err);
  }
};
