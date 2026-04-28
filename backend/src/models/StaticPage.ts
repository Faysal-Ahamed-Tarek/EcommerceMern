import mongoose, { Schema, Document } from 'mongoose';

export interface IStaticPage extends Document {
  slug: 'privacy-policy' | 'about' | 'terms';
  content: string;
}

const StaticPageSchema = new Schema<IStaticPage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: ['privacy-policy', 'about', 'terms'],
    },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

const StaticPage = mongoose.model<IStaticPage>('StaticPage', StaticPageSchema);
export default StaticPage;
