import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
      default: 'Pending',
      index: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminComment: {
      type: String,
      default: '',
      maxlength: 300,
    },
    kilometers: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true }
);

// Indexes for common query patterns
expenseSchema.index({ date: -1 });
expenseSchema.index({ userId: 1, date: -1 }); // For user expense queries
expenseSchema.index({ status: 1, date: -1 }); // For admin filtering by status
expenseSchema.index({ userId: 1, status: 1, date: -1 }); // Compound index for admin queries
expenseSchema.index({ category: 1 }); // For category filtering
expenseSchema.index({ createdAt: -1 }); // For admin expense listing

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;

