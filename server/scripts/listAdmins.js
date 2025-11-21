import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const listAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find all users with admin role
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: 1 });

    if (admins.length === 0) {
      console.log('❌ No admin users found in database\n');
      console.log('To create admin accounts, run: npm run create-admins');
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):\n`);
      console.log('='.repeat(60));
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin Details:`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.createdAt.toLocaleString()}`);
        console.log(`   Updated: ${admin.updatedAt.toLocaleString()}`);
        console.log(`   ID: ${admin._id}`);
      });
      console.log('\n' + '='.repeat(60));
      console.log('\n📍 Storage Location:');
      console.log('   Database: MongoDB');
      console.log(`   Collection: users`);
      console.log(`   Connection: ${process.env.MONGODB_URI?.split('@')[1] || 'Local/Atlas'}`);
      console.log('\n💡 Note: Passwords are hashed and not displayed for security.');
      console.log('   To reset a password, use: npm run reset-password <email> <new-password>');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

listAdmins();












