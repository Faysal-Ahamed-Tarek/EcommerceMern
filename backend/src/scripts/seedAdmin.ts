import 'dotenv/config';
import mongoose from 'mongoose';
import { Admin } from '../models';

const EMAIL = 'admin@ecommerce.com';
const PASSWORD = 'Admin@1234';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const existing = await Admin.findOne({ email: EMAIL });
  if (existing) {
    console.log('✅ Admin already exists:', EMAIL);
    await mongoose.disconnect();
    return;
  }

  await Admin.create({ email: EMAIL, password: PASSWORD });
  console.log('✅ Admin created successfully');
  console.log('   Email   :', EMAIL);
  console.log('   Password:', PASSWORD);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
