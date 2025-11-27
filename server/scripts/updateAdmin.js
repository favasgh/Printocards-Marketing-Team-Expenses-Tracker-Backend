import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const email = process.argv[2];

    if (!email) {
      console.log('❌ Please provide an admin email to update');
      console.log('\nUsage: npm run update-admin <email> [options]');
      console.log('\nOptions:');
      console.log('  --name "New Name"     Update admin name');
      console.log('  --email new@email.com Update admin email');
      console.log('  --password newpass     Update admin password');
      console.log('\nExamples:');
      console.log('  npm run update-admin admin1@printo.com --name "Admin One"');
      console.log('  npm run update-admin admin1@printo.com --password newpassword123');
      console.log('  npm run update-admin admin1@printo.com --email admin1new@printo.com');
      console.log('  npm run update-admin admin1@printo.com --name "Admin One" --password newpass');
      await mongoose.disconnect();
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Looking for admin with email: ${normalizedEmail}\n`);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log('❌ User not found in database');
      await mongoose.disconnect();
      process.exit(1);
    }

    if (user.role !== 'admin') {
      console.log('❌ This user is not an admin');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Parse command line arguments
    const args = process.argv.slice(3);
    let newName = null;
    let newEmail = null;
    let newPassword = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--name' && args[i + 1]) {
        newName = args[i + 1];
        i++;
      } else if (args[i] === '--email' && args[i + 1]) {
        newEmail = args[i + 1].toLowerCase().trim();
        i++;
      } else if (args[i] === '--password' && args[i + 1]) {
        newPassword = args[i + 1];
        i++;
      }
    }

    if (!newName && !newEmail && !newPassword) {
      console.log('❌ No update options provided');
      console.log('\nCurrent Admin Details:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log(`   Updated: ${user.updatedAt.toLocaleString()}\n`);
      console.log('Use --name, --email, or --password to update');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('Current Admin Details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}\n`);

    // Check if new email already exists
    if (newEmail && newEmail !== normalizedEmail) {
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) {
        console.log(`❌ Error: Email ${newEmail} already exists in database`);
        await mongoose.disconnect();
        process.exit(1);
      }
    }

    // Update fields
    let updated = false;
    const updates = [];

    if (newName && newName !== user.name) {
      user.name = newName;
      updates.push(`Name: ${user.name} → ${newName}`);
      updated = true;
    }

    if (newEmail && newEmail !== normalizedEmail) {
      user.email = newEmail;
      updates.push(`Email: ${normalizedEmail} → ${newEmail}`);
      updated = true;
    }

    if (newPassword) {
      user.password = newPassword; // Will be hashed by pre-save hook
      updates.push('Password: Updated');
      updated = true;
    }

    if (!updated) {
      console.log('⚠️  No changes detected. All values are the same.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('Updating admin...');
    console.log('Changes:');
    updates.forEach(update => console.log(`   ✓ ${update}`));
    console.log('');

    await user.save();

    console.log('✅ Admin updated successfully!\n');
    console.log('Updated Admin Details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    if (newPassword) {
      console.log(`   Password: ${newPassword}`);
    }
    console.log(`   Updated: ${user.updatedAt.toLocaleString()}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.error('❌ Error: Email already exists in database');
    } else {
      console.error('❌ Error updating admin:', error.message);
    }
    process.exit(1);
  }
};

updateAdmin();

















