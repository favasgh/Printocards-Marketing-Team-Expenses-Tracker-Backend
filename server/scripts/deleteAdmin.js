import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Expense from '../src/models/Expense.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const deleteAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const email = process.argv[2];

    if (!email) {
      console.log('❌ Please provide an admin email to delete');
      console.log('Usage: npm run delete-admin <email>');
      console.log('Example: npm run delete-admin admin2@printo.com\n');
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
      console.log('\n💡 Only admin users can be deleted using this script.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if this admin has approved any expenses
    const expensesCount = await Expense.countDocuments({ approvedBy: user._id });
    
    console.log('⚠️  WARNING: This will permanently delete the admin account!');
    console.log(`\nAdmin Details:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt.toLocaleString()}`);
    if (expensesCount > 0) {
      console.log(`   ⚠️  This admin has approved/processed ${expensesCount} expense(s)`);
      console.log(`   Note: Expenses will remain, but approvedBy reference will be removed`);
    }
    console.log('\n⚠️  This action cannot be undone!');

    // In a real scenario, you might want to add a confirmation prompt
    // For now, we'll proceed with deletion
    console.log('\n🗑️  Deleting admin account...');

    // Remove approvedBy references from expenses (set to null)
    if (expensesCount > 0) {
      await Expense.updateMany(
        { approvedBy: user._id },
        { $unset: { approvedBy: '' } }
      );
      console.log(`   ✓ Removed ${expensesCount} expense reference(s)`);
    }

    // Delete the user
    await User.deleteOne({ _id: user._id });

    console.log('✅ Admin account deleted successfully!');
    console.log(`   Email: ${normalizedEmail}`);
    console.log(`   Name: ${user.name}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

deleteAdmin();
















