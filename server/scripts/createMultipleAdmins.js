import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Go up one level from scripts/ to server/ root
dotenv.config({ path: join(__dirname, '..', '.env') });

// Define 3 admin accounts
// You can customize these in your .env file or modify the values below
const adminAccounts = [
  {
    name: process.env.ADMIN1_NAME || 'Admin 1',
    email: process.env.ADMIN1_EMAIL || 'admin1@printo.com',
    password: process.env.ADMIN1_PASSWORD || 'admin123',
  },
  {
    name: process.env.ADMIN2_NAME || 'Admin 2',
    email: process.env.ADMIN2_EMAIL || 'admin2@printo.com',
    password: process.env.ADMIN2_PASSWORD || 'admin123',
  },
  {
    name: process.env.ADMIN3_NAME || 'Admin 3',
    email: process.env.ADMIN3_EMAIL || 'admin3@printo.com',
    password: process.env.ADMIN3_PASSWORD || 'admin123',
  },
];

const createMultipleAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    for (const adminData of adminAccounts) {
      const { name, email, password } = adminData;

      // Check if admin already exists
      const existingAdmin = await User.findOne({ email });
      if (existingAdmin) {
        if (existingAdmin.role === 'admin') {
          console.log(`✓ Admin already exists: ${email}`);
          console.log(`  Name: ${existingAdmin.name}`);
          console.log(`  Role: ${existingAdmin.role}\n`);
          continue;
        } else {
          // Update existing user to admin
          existingAdmin.name = name;
          existingAdmin.role = 'admin';
          existingAdmin.password = password; // Will be hashed by pre-save hook
          await existingAdmin.save();
          console.log(`✓ Updated user to admin: ${email}`);
          console.log(`  Name: ${name}`);
          console.log(`  Password: ${password}`);
          console.log(`  Role: admin\n`);
          continue;
        }
      }

      // Create new admin user
      const admin = await User.create({
        name,
        email,
        password,
        role: 'admin',
      });

      console.log(`✓ Admin user created successfully!`);
      console.log(`  Name: ${name}`);
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      console.log(`  Role: ${admin.role}\n`);
    }

    console.log('All admin accounts processed!');
    console.log('\n=== Admin Login Credentials ===');
    adminAccounts.forEach((admin, index) => {
      console.log(`\nAdmin ${index + 1}:`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Password: ${admin.password}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admins:', error);
    process.exit(1);
  }
};

createMultipleAdmins();

