import mongoose, { Schema, Document } from 'mongoose';

interface PanelItem {
  imageUrl: string;
  publicId: string;
  link: string;
  altText: string;
}

export interface IPromoPanel extends Document {
  left: PanelItem;
  right: PanelItem;
}

const PanelItemSchema = new Schema<PanelItem>(
  {
    imageUrl: { type: String, default: '' },
    publicId: { type: String, default: '' },
    link: { type: String, default: '' },
    altText: { type: String, default: '' },
  },
  { _id: false }
);

const PromoPanelSchema = new Schema<IPromoPanel>(
  {
    left: { type: PanelItemSchema, default: () => ({}) },
    right: { type: PanelItemSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const PromoPanel = mongoose.model<IPromoPanel>('PromoPanel', PromoPanelSchema);
export default PromoPanel;
