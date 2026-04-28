import { Request, Response, NextFunction } from 'express';
import StaticPage from '../models/StaticPage';

const VALID_SLUGS = ['privacy-policy', 'about', 'terms'];

export const getStaticPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    if (!VALID_SLUGS.includes(slug)) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }
    let page = await StaticPage.findOne({ slug }).lean();
    if (!page) {
      page = (await StaticPage.create({ slug, content: '' })) as any;
    }
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
};

export const updateStaticPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    if (!VALID_SLUGS.includes(slug)) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }
    const page = await StaticPage.findOneAndUpdate(
      { slug },
      { $set: { content: req.body.content ?? '' } },
      { new: true, upsert: true }
    ).lean();
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
};
