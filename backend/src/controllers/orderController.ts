import { Request, Response, NextFunction } from 'express';
import { Order, Product } from '../models';

const generateOrderId = async (): Promise<string> => {
  const count = await Order.countDocuments();
  return `ORD-${1001 + count}`;
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;

    // Stock validation
    for (const item of items) {
      const isDefaultVariant = !item.variant || item.variant === 'Default';

      if (isDefaultVariant) {
        const product = await Product.findOne(
          { slug: item.productSlug },
          { totalStock: 1 }
        ).lean();
        if (!product) {
          res.status(400).json({ success: false, message: `Product ${item.productSlug} not found` });
          return;
        }
        if (product.totalStock !== undefined && product.totalStock < item.quantity) {
          res.status(400).json({ success: false, message: `Insufficient stock for ${item.title}` });
          return;
        }
      } else {
        const product = await Product.findOne(
          { slug: item.productSlug, 'variants.name': item.variant },
          { 'variants.$': 1, totalStock: 1 }
        ).lean();
        if (!product) {
          const exists = await Product.findOne({ slug: item.productSlug }, { _id: 1 }).lean();
          if (!exists) {
            res.status(400).json({ success: false, message: `Product ${item.productSlug} not found` });
            return;
          }
        } else {
          const variant = product.variants?.[0];
          if (variant?.stock !== undefined && variant.stock < item.quantity) {
            res.status(400).json({
              success: false,
              message: `Insufficient stock for ${item.title} (${item.variant})`,
            });
            return;
          }
        }
      }
    }

    // Stock deduction + enrich items with category and image
    const enrichedItems = await Promise.all(
      items.map(async (item: typeof items[number]) => {
        const isDefaultVariant = !item.variant || item.variant === 'Default';
        const product = await Product.findOne(
          { slug: item.productSlug },
          { category: 1, images: 1 }
        ).lean();
        const category = product?.category ?? '';
        const image = product?.images?.[0]?.cloudinaryUrl ?? '';

        if (isDefaultVariant) {
          await Product.updateOne(
            { slug: item.productSlug },
            { $inc: { totalStock: -item.quantity } }
          );
        } else {
          await Product.updateOne(
            { slug: item.productSlug, 'variants.name': item.variant },
            { $inc: { 'variants.$.stock': -item.quantity, totalStock: -item.quantity } }
          );
        }

        return { ...item, category, image };
      })
    );

    const orderId = await generateOrderId();
    const order = await Order.create({ ...req.body, items: enrichedItems, orderId });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 200, status, startDate, endDate, category } = req.query;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status as string;
    if (category) filter['items.category'] = category as string;

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filter.createdAt = dateFilter;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: orders, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean();
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getOrderByOrderId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).lean();
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerName, phone, address, note, status } = req.body;
    const update: Record<string, unknown> = {};
    if (customerName !== undefined) update.customerName = customerName;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;
    if (note !== undefined) update.note = note;
    if (status !== undefined) update.status = status;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id).lean();
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};
