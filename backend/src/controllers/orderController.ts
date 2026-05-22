import { Request, Response, NextFunction } from 'express';
import { Order, Product } from '../models';

// No DB round-trip: timestamp (ms) + 3-digit random handles any realistic
// concurrency. The unique index on orderId is the hard safety net.
const generateOrderId = (): string => {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ORD-${Date.now()}${rand}`;
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body as {
      items: Array<{ productSlug: string; title: string; variant: string; quantity: number }>;
    };

    // Single batch fetch — replaces the N×(1-2) query validation loop
    const slugs = [...new Set(items.map((i) => i.productSlug))];
    const products = await Product.find(
      { slug: { $in: slugs } },
      { slug: 1, totalStock: 1, variants: 1, category: 1, images: 1 }
    ).lean();
    const productMap = new Map(products.map((p) => [p.slug, p]));

    // Validate stock from the in-memory map — no extra DB queries
    for (const item of items) {
      const product = productMap.get(item.productSlug);
      if (!product) {
        res.status(400).json({ success: false, message: `Product ${item.productSlug} not found` });
        return;
      }
      const isDefaultVariant = !item.variant || item.variant === 'Default';
      if (isDefaultVariant) {
        if (product.totalStock !== undefined && product.totalStock < item.quantity) {
          res.status(400).json({ success: false, message: `Insufficient stock for ${item.title}` });
          return;
        }
      } else {
        const variant = product.variants?.find((v) => v.weight_label === item.variant);
        if (variant?.stock !== undefined && variant.stock < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.title} (${item.variant})`,
          });
          return;
        }
      }
    }

    // Enrich items with category + image from the in-memory map
    const enrichedItems = items.map((item) => {
      const product = productMap.get(item.productSlug);
      return {
        ...item,
        category: product?.category ?? '',
        image: product?.images?.[0]?.cloudinaryUrl ?? '',
      };
    });

    // Deduct stock in one bulkWrite — replaces N individual updateOne calls
    const bulkOps = items.map((item) => {
      const isDefaultVariant = !item.variant || item.variant === 'Default';
      if (isDefaultVariant) {
        return {
          updateOne: {
            filter: { slug: item.productSlug },
            update: { $inc: { totalStock: -item.quantity } },
          },
        };
      }
      return {
        updateOne: {
          filter: { slug: item.productSlug, 'variants.name': item.variant },
          update: { $inc: { 'variants.$.stock': -item.quantity, totalStock: -item.quantity } },
        },
      };
    });
    await Product.bulkWrite(bulkOps);

    const orderId = generateOrderId();
    const order = await Order.create({ ...req.body, items: enrichedItems, orderId });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, status, startDate, endDate, category } = req.query;
    const safeLimit = Math.min(Number(limit), 200);
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

    const skip = (Number(page) - 1) * safeLimit;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: orders, total, page: Number(page), limit: safeLimit });
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
