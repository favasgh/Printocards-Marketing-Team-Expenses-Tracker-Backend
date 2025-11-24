import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import asyncHandler from '../utils/asyncHandler.js';

const buildQueryFilters = (query) => {
  const filters = {};
  if (query.status) {
    filters.status = query.status;
  }
  if (query.category) {
    filters.category = { $regex: query.category, $options: 'i' };
  }
  if (query.search) {
    filters.$or = [
      { category: { $regex: query.search, $options: 'i' } },
      { note: { $regex: query.search, $options: 'i' } },
      { location: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.startDate || query.endDate) {
    filters.date = {};
    if (query.startDate) {
      filters.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.date.$lte = new Date(query.endDate);
    }
  }
  return filters;
};

export const createExpense = asyncHandler(async (req, res) => {
  const { category, amount, date, location, note } = req.body;

  const payload = {
    userId: req.user._id,
    category,
    amount,
    date,
    location,
    note,
  };

  if (req.file?.path) {
    payload.imageUrl = req.file.path;
  }

  const expense = await Expense.create(payload);

  return res.status(201).json(expense);
});

export const getMyExpenses = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  if (!mongoose.isValidObjectId(req.user._id)) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }

  // Use validated query if available (from validation middleware), otherwise use req.query
  const queryParams = req.validatedQuery || req.query;
  
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const filters = buildQueryFilters(queryParams);
  filters.userId = req.user._id;

  // Sort by date descending, fallback to createdAt if date is missing
  // Populate approvedBy to show which admin approved/rejected/paid
  const [records, total] = await Promise.all([
    Expense.find(filters)
      .populate('approvedBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Expense.countDocuments(filters),
  ]);

  return res.json({
    data: records || [],
    pagination: {
      total: total || 0,
      page,
      pages: Math.ceil((total || 0) / limit),
      limit,
    },
  });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid expense id.' });
  }

  const expense = await Expense.findOne({ _id: id, userId: req.user._id });

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  if (expense.status !== 'Pending') {
    return res.status(400).json({ message: 'Only pending expenses can be edited.' });
  }

  const updates = { ...req.body };
  if (req.file?.path) {
    updates.imageUrl = req.file.path;
  }

  Object.assign(expense, updates);
  await expense.save();

  return res.json(expense);
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid expense id.' });
  }

  const expense = await Expense.findOne({ _id: id, userId: req.user._id });

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  if (expense.status !== 'Pending') {
    return res.status(400).json({ message: 'Only pending expenses can be deleted.' });
  }

  await expense.deleteOne();

  return res.json({ message: 'Expense removed.' });
});

