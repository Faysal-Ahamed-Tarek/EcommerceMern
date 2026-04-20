import { Request, Response, NextFunction } from 'express';
import SiteConfig from '../models/SiteConfig';

export const getConfig = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let config = await SiteConfig.findOne().lean();
    if (!config) {
      config = await SiteConfig.create({ primaryColor: '#16a34a' }) as any;
    }
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

export const updateConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await SiteConfig.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true }
    ).lean();
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};
