import { Request, Response, NextFunction } from 'express';
import PromoPanel from '../models/PromoPanel';

export const getPromoPanel = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let panel = await PromoPanel.findOne().lean();
    if (!panel) {
      panel = await PromoPanel.create({});
    }
    res.json({ success: true, data: panel });
  } catch (err) {
    next(err);
  }
};

export const updatePromoPanel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const panel = await PromoPanel.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    }).lean();
    res.json({ success: true, data: panel });
  } catch (err) {
    next(err);
  }
};
