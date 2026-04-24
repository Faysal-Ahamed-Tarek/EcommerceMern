import { Request, Response, NextFunction } from 'express';
import { Category, Product } from '../models';

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [categories, productCounts] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Product.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);
    const countMap = new Map<string, number>(
      productCounts.map((c: { _id: string; count: number }) => [c._id, c.count])
    );
    const withCounts = categories.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat.name) ?? 0,
    }));
    res.json({ success: true, data: withCounts });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
