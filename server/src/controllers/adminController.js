import mongoose from 'mongoose';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import moment from 'moment-timezone';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const buildAdminFilters = (query) => {
  const filters = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.salesman && mongoose.isValidObjectId(query.salesman)) {
    filters.userId = query.salesman;
  }

  if (query.category) {
    filters.category = { $regex: query.category, $options: 'i' };
  }

  if (query.search) {
    filters.$or = [
      { note: { $regex: query.search, $options: 'i' } },
      { location: { $regex: query.search, $options: 'i' } },
    ];
  }

  // Handle date filtering with interval support
  if (query.startDate || query.endDate) {
    filters.date = {};
    if (query.startDate) {
      filters.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.date.$lte = new Date(query.endDate);
    }
  } else if (query.interval) {
    // If no explicit dates but interval is provided, calculate date range
    const now = new Date();
    if (query.interval === 'weekly') {
      // Get start of current week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      // Get end of current week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      filters.date = {
        $gte: startOfWeek,
        $lte: endOfWeek,
      };
    } else if (query.interval === 'monthly') {
      // Get start of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      // Get end of current month
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      filters.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }
  }

  return filters;
};

export const getAllExpenses = asyncHandler(async (req, res) => {
  // Use validated query if available (from validation middleware), otherwise use req.query
  const queryParams = req.validatedQuery || req.query;
  
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 20;
  const skip = (page - 1) * limit;

  const filters = buildAdminFilters(queryParams);

  const [records, total] = await Promise.all([
    Expense.find(filters)
      .populate('userId', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Expense.countDocuments(filters),
  ]);

  res.json({
    data: records,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
});

export const updateExpenseStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminComment } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid expense id.' });
  }

  // Build update object using $set for regular fields
  const updateData = {
    $set: {
      status,
      adminComment: adminComment !== undefined && adminComment !== null ? String(adminComment) : '',
    },
  };

  // Only set approvedBy if status is not Pending
  if (status !== 'Pending') {
    updateData.$set.approvedBy = req.user.id || req.user._id;
  } else {
    // When reverting to Pending, unset approvedBy
    updateData.$unset = { approvedBy: '' };
  }

  // Use findOneAndUpdate for better performance and atomic update
  const expense = await Expense.findOneAndUpdate(
    { _id: id },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('userId', 'name email')
    .populate('approvedBy', 'name email')
    .lean();

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  res.json(expense);
});

export const getSalesmen = asyncHandler(async (req, res) => {
  // Use lean() and limit fields for faster query
  const users = await User.find({ role: 'user' })
    .select('name email role createdAt')
    .sort({ name: 1 })
    .lean();
  res.json(users);
});

export const getSalesmanSummary = asyncHandler(async (req, res) => {
  const summary = await Expense.aggregate([
    {
      $group: {
        _id: '$userId',
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0],
          },
        },
        paid: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0],
          },
        },
      },
    },
  ]);

  const userIds = summary.map((item) => item._id).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } }).select('name email').lean();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  const data = summary
    .map((item) => {
      const user = userMap.get(item._id?.toString());
      if (!user) {
        return null;
      }
      return {
        salesman: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        pending: item.pending || 0,
        paid: item.paid || 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.salesman.name.localeCompare(b.salesman.name));

  res.json(data);
});

const buildReportData = async (filters, interval) => {
  const matchStage = { $match: filters };

  const groupInterval =
    interval === 'weekly'
      ? {
          $dateTrunc: {
            date: '$date',
            unit: 'week',
          },
        }
      : {
          $dateTrunc: {
            date: '$date',
            unit: 'month',
          },
        };

  // Optimize aggregations with allowDiskUse for large datasets and better index usage
  const aggregationOptions = { allowDiskUse: true };
  
  // Determine best index hint based on filters
  let indexHint = null;
  if (filters.userId && filters.status) {
    indexHint = { userId: 1, status: 1, date: -1 };
  } else if (filters.status) {
    indexHint = { status: 1, date: -1 };
  } else if (filters.userId) {
    indexHint = { userId: 1, date: -1 };
  } else {
    indexHint = { date: -1 };
  }

  const [summaryAgg, byCategory, bySalesman, timeline] = await Promise.all([
    Expense.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
          paid: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] } },
        },
      },
    ], aggregationOptions),
    Expense.aggregate([
      matchStage,
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ], aggregationOptions),
    Expense.aggregate([
      matchStage,
      {
        $group: {
          _id: '$userId',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ], aggregationOptions),
    Expense.aggregate([
      matchStage,
      {
        $group: {
          _id: groupInterval,
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ], aggregationOptions),
  ]);

  const summary = summaryAgg?.[0];

  return {
    summary: summary || {
      totalAmount: 0,
      totalExpenses: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
    },
    byCategory,
    bySalesman,
    timeline,
  };
};

const sendExcelReport = (res, reportData, filters) => {
  const wb = XLSX.utils.book_new();

  const summarySheet = [
    ['Metric', 'Value'],
    ['Total Amount', reportData.summary.totalAmount || 0],
    ['Total Expenses', reportData.summary.totalExpenses || 0],
    ['Pending', reportData.summary.pending || 0],
    ['Approved', reportData.summary.approved || 0],
    ['Rejected', reportData.summary.rejected || 0],
    ['Paid', reportData.summary.paid || 0],
  ];

  const categoriesSheet = [['Category', 'Amount', 'Count'], ...reportData.byCategory.map((item) => [item._id, item.amount, item.count])];
  const salesmanSheet = [['SalesmanId', 'Amount', 'Count'], ...reportData.bySalesman.map((item) => [item._id?.toString(), item.amount, item.count])];
  const timelineSheet = [['Period', 'Amount', 'Count'], ...reportData.timeline.map((item) => [item._id?.toISOString(), item.amount, item.count])];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summarySheet), 'Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(categoriesSheet), 'By Category');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(salesmanSheet), 'By Salesman');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(timelineSheet), 'Timeline');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const filename = `printo-expenses-${Date.now()}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
};

const sendPdfReport = (res, reportData, filters) => {
  const doc = new PDFDocument({ margin: 40 });
  const filename = `printo-expenses-${Date.now()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  doc.fontSize(20).text('Printo Field Expense Report', { align: 'center' }).moveDown();
  doc.fontSize(12).text(`Generated at: ${moment().format('YYYY-MM-DD HH:mm')}`, { align: 'right' }).moveDown();

  doc.fontSize(16).text('Summary').moveDown(0.5);
  doc.fontSize(12);
  const { summary } = reportData;
  doc.text(`Total Amount: ${summary.totalAmount?.toFixed(2) || 0}`);
  doc.text(`Total Expenses: ${summary.totalExpenses || 0}`);
  doc.text(`Pending: ${summary.pending || 0}`);
  doc.text(`Approved: ${summary.approved || 0}`);
  doc.text(`Rejected: ${summary.rejected || 0}`);
  doc.text(`Paid: ${summary.paid || 0}`);
  doc.moveDown();

  doc.fontSize(16).text('By Category').moveDown(0.5);
  reportData.byCategory.forEach((item) => {
    doc.fontSize(12).text(`${item._id}: ${item.amount.toFixed(2)} (${item.count} expenses)`);
  });
  doc.moveDown();

  doc.fontSize(16).text('Timeline').moveDown(0.5);
  reportData.timeline.forEach((item) => {
    doc.fontSize(12).text(`${moment(item._id).format('YYYY-MM-DD')}: ${item.amount.toFixed(2)} (${item.count})`);
  });

  doc.end();
};

export const getReports = asyncHandler(async (req, res) => {
  // Use validated query if available (from validation middleware), otherwise use req.query
  const queryParams = req.validatedQuery || req.query;
  
  const { interval = 'monthly', format = 'json' } = queryParams;
  const filters = buildAdminFilters(queryParams);
  if (queryParams.salesman && mongoose.isValidObjectId(queryParams.salesman)) {
    filters.userId = new mongoose.Types.ObjectId(queryParams.salesman);
  }

  const reportData = await buildReportData(filters, interval);

  if (format === 'excel') {
    return sendExcelReport(res, reportData, filters);
  }

  if (format === 'pdf') {
    return sendPdfReport(res, reportData, filters);
  }

  return res.json(reportData);
});

