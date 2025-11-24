import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const createNewAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get admin details from command line arguments or use defaults
    const name = process.argv[2] || process.env.ADMIN_NAME || 'Admin User';
    const email = process.argv[3] || process.env.ADMIN_EMAIL;
    const password = process.argv[4] || process.env.ADMIN_PASSWORD || 'admin123';

    if (!email) {
      console.log('❌ Email is required!');
      console.log('\nUsage: npm run create-new-admin [name] [email] [password]');
      console.log('\nExamples:');
      console.log('  npm run create-new-admin "John Doe" john@printo.com mypassword123');
      console.log('  npm run create-new-admin john@printo.com mypassword123');
      console.log('  npm run create-new-admin john@printo.com');
      console.log('\nOr set in .env file:');
      console.log('  ADMIN_NAME=John Doe');
      console.log('  ADMIN_EMAIL=john@printo.com');
      console.log('  ADMIN_PASSWORD=mypassword123');
      await mongoose.disconnect();
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log('Creating new admin account...\n');
    console.log('Admin Details:');
    console.log(`  Name: ${name}`);
    console.log(`  Email: ${normalizedEmail}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: admin\n`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log('⚠️  Admin user already exists with this email!');
        console.log(`  Name: ${existingUser.name}`);
        console.log(`  Email: ${existingUser.email}`);
        console.log(`  Role: ${existingUser.role}`);
        console.log(`  Created: ${existingUser.createdAt.toLocaleString()}\n`);
        console.log('💡 To update this admin, use: npm run reset-password <email> <new-password>');
        await mongoose.disconnect();
        process.exit(0);
      } else {
        // Update existing user to admin
        console.log('⚠️  User exists but is not an admin. Updating to admin...\n');
        existingUser.name = name;
        existingUser.role = 'admin';
        existingUser.password = password; // Will be hashed by pre-save hook
        await existingUser.save();
        
        console.log('✅ User updated to admin successfully!');
        console.log(`  Name: ${existingUser.name}`);
        console.log(`  Email: ${existingUser.email}`);
        console.log(`  Password: ${password}`);
        console.log(`  Role: ${existingUser.role}\n`);
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    // Create new admin user
    const admin = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'admin',
    });

    console.log('✅ Admin account created successfully!\n');
    console.log('Login Credentials:');
    console.log(`  Name: ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Created: ${admin.createdAt.toLocaleString()}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.error('❌ Error: Email already exists in database');
    } else {
      console.error('❌ Error creating admin:', error.message);
    }
    process.exit(1);
  }
};

createNewAdmin();















