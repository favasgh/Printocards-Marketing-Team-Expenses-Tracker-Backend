import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import Expense from '../src/models/Expense.js';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const checkExpenses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const email = process.argv[2];
    
    if (email) {
      // Check expenses for specific user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        await mongoose.disconnect();
        process.exit(1);
      }

      console.log(`Checking expenses for: ${user.name} (${user.email})\n`);
      
      const expenses = await Expense.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(10);

      if (expenses.length === 0) {
        console.log('❌ No expenses found for this user');
      } else {
        console.log(`✅ Found ${expenses.length} expense(s):\n`);
        expenses.forEach((expense, index) => {
          console.log(`${index + 1}. Category: ${expense.category}`);
          console.log(`   Amount: ₹${expense.amount}`);
          console.log(`   Date: ${expense.date}`);
          console.log(`   Status: ${expense.status}`);
          console.log(`   Created: ${expense.createdAt}`);
          console.log('');
        });
      }
    } else {
      // Show all expenses grouped by user
      const expenses = await Expense.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(20);

      if (expenses.length === 0) {
        console.log('❌ No expenses found in database');
      } else {
        console.log(`✅ Found ${expenses.length} expense(s):\n`);
        expenses.forEach((expense, index) => {
          const user = expense.userId;
          console.log(`${index + 1}. User: ${user?.name || 'Unknown'} (${user?.email || 'N/A'})`);
          console.log(`   Category: ${expense.category}`);
          console.log(`   Amount: ₹${expense.amount}`);
          console.log(`   Status: ${expense.status}`);
          console.log(`   Created: ${expense.createdAt}`);
          console.log('');
        });
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkExpenses();






