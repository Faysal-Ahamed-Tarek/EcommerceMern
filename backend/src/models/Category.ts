import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    image: { type: String },
  },
  { timestamps: true }
);

CategorySchema.pre('save', async function () {
  if (!this.isModified('name') && this.slug) return;

  const base = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  let slug = base;
  let suffix = 1;
  while (
    await (mongoose.models.Category as Model<ICategory>).exists({
      slug,
      _id: { $ne: this._id },
    })
  ) {
    slug = `${base}-${suffix++}`;
  }
  this.slug = slug;
});

const Category = mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
