import 'dotenv/config';
import mongoose from 'mongoose';
import { Admin } from '../models';

const ADMINS = [
  { email: 'anwarmdnoor@gmail.com', password: 'S9!vQ2#nL7@tR4$p' },
  { email: 'jupremiumteam1@gmail.com', password: 'K3^mZ8&xP1!dW6@q' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI as string);

  // Remove all existing admins
  const deleted = await Admin.deleteMany({});
  console.log(`🗑️  Removed ${deleted.deletedCount} existing admin(s)`);

  // Create fresh admins (passwords are hashed by the pre-save hook)
  for (const { email, password } of ADMINS) {
    await Admin.create({ email, password });
    console.log(`✅ Created admin: ${email}`);
  }

  console.log('\n🔐 Login credentials:');
  for (const { email, password } of ADMINS) {
    console.log(`   ${email}  →  ${password}`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
