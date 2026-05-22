import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI as string;

async function migrate() {
  if (!MONGO_URI) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db!;
  const col = db.collection('products');

  const products = await col.find({}).toArray();
  console.log(`📦 Found ${products.length} products to migrate`);

  let updated = 0;

  for (const p of products) {
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};

    // 1. title → title_en
    if (!p.title_en && p.title) {
      $set.title_en = p.title;
    }

    // 2. Remove obsolete fields
    for (const field of ['title', 'howToUse', 'ingredients', 'indications']) {
      if (p[field] !== undefined) $unset[field] = 1;
    }

    // 3. Migrate variants to new schema
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const needsMigration = p.variants.some(
        (v: Record<string, unknown>) => v.weight_label === undefined && (v.name !== undefined || v.price !== undefined)
      );
      if (needsMigration) {
        $set.variants = p.variants.map((v: Record<string, unknown>) => ({
          weight_label: v.weight_label ?? v.name ?? 'Default',
          base_price:   v.base_price   ?? v.price ?? 0,
          discount_price: v.discount_price ?? (v.discountPrice && (v.discountPrice as number) > 0 ? v.discountPrice : undefined),
          stock:        typeof v.stock === 'number' ? v.stock : 0,
        }));
      }
    }

    if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) continue;

    await col.updateOne(
      { _id: p._id },
      {
        ...(Object.keys($set).length  ? { $set }   : {}),
        ...(Object.keys($unset).length ? { $unset } : {}),
      }
    );

    updated++;
    console.log(`  ✅ Migrated: ${p.title_en ?? p.title ?? p._id}`);
  }

  console.log(`\n✅ Migration complete. ${updated}/${products.length} products updated.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
