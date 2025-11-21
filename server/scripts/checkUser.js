import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@printo.com';
    console.log(`Checking user with email: ${email}\n`);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ User not found in database');
      console.log('\nPossible reasons:');
      console.log('1. Email is incorrect');
      console.log('2. User was never created');
      console.log('3. Database connection issue');
    } else {
      console.log('✅ User found!');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Created:', user.createdAt);
      console.log('\nTo test login:');
      console.log('1. If you ran create-admin WITHOUT ADMIN_PASSWORD, use your ORIGINAL registration password');
      console.log('2. If you ran create-admin WITH ADMIN_PASSWORD, use that password');
      console.log('3. If you never ran create-admin, use your registration password');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUser();











