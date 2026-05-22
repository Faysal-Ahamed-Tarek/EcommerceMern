import 'dotenv/config';
import mongoose from 'mongoose';
import { Admin } from '../models';

const TARGET_EMAIL = 'anwarmdnoor@gmail.com';
const TARGET_PASSWORD = 'gTK)h69U?6pvu++E';

async function resetAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Make sure .env is present in the backend folder.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  let admin = await Admin.findOne({ email: TARGET_EMAIL });

  if (admin) {
    // Reset password and clear any lockout state
    admin.password = TARGET_PASSWORD;
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.passwordChangedAt = new Date();
    await admin.save();
    console.log(`✅ Password reset for existing admin: ${TARGET_EMAIL}`);
  } else {
    await Admin.create({ email: TARGET_EMAIL, password: TARGET_PASSWORD });
    console.log(`✅ Created new admin: ${TARGET_EMAIL}`);
  }

  console.log(`\n🔐 Login at https://admin.herblifenutri.com`);
  console.log(`   Email:    ${TARGET_EMAIL}`);
  console.log(`   Password: ${TARGET_PASSWORD}`);

  await mongoose.disconnect();
}

resetAdmin().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
