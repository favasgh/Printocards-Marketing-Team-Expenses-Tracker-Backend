import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Expense from '../src/models/Expense.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const deleteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const email = process.argv[2];

    if (!email) {
      console.log('❌ Please provide a user email to delete');
      console.log('Usage: npm run delete-user <email>');
      console.log('Example: npm run delete-user user@example.com\n');
      await mongoose.disconnect();
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Looking for user with email: ${normalizedEmail}\n`);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log('❌ User not found in database');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check user's expenses
    const expensesCount = await Expense.countDocuments({ userId: user._id });
    
    // Check if admin has approved any expenses
    const approvedExpensesCount = user.role === 'admin' 
      ? await Expense.countDocuments({ approvedBy: user._id })
      : 0;
    
    console.log('⚠️  WARNING: This will permanently delete the user account!');
    console.log(`\nUser Details:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt.toLocaleString()}`);
    
    if (expensesCount > 0) {
      console.log(`   ⚠️  This user has ${expensesCount} expense(s)`);
      console.log(`   Note: All expenses will be permanently deleted`);
    }
    
    if (approvedExpensesCount > 0) {
      console.log(`   ⚠️  This admin has approved/processed ${approvedExpensesCount} expense(s)`);
      console.log(`   Note: Expenses will remain, but approvedBy reference will be removed`);
    }
    
    console.log('\n⚠️  This action cannot be undone!');

    // In a real scenario, you might want to add a confirmation prompt
    // For now, we'll proceed with deletion
    console.log('\n🗑️  Deleting user account...');

    // Delete all expenses created by this user
    if (expensesCount > 0) {
      await Expense.deleteMany({ userId: user._id });
      console.log(`   ✓ Deleted ${expensesCount} expense(s)`);
    }

    // Remove approvedBy references from expenses (set to null) if admin
    if (approvedExpensesCount > 0) {
      await Expense.updateMany(
        { approvedBy: user._id },
        { $unset: { approvedBy: '' } }
      );
      console.log(`   ✓ Removed ${approvedExpensesCount} expense reference(s)`);
    }

    // Delete the user
    await User.deleteOne({ _id: user._id });

    console.log('✅ User account deleted successfully!');
    console.log(`   Email: ${normalizedEmail}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

deleteUser();

