import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productSlug: string;
  title: string;
  variant: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface IOrder extends Document {
  orderId: string;
  note?: string;
  customerName: string;
  phone: string;
  address: string;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: 'cod';
  paymentStatus: 'pending' | 'paid';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    note: { type: String },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    items: [
      {
        productSlug: { type: String, required: true },
        title: { type: String, required: true },
        variant: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        category: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cod'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
