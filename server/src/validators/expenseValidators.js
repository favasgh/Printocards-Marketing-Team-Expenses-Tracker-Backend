import Joi from 'joi';

export const expenseSchema = Joi.object({
  category: Joi.string().min(2).max(60).required(),
  amount: Joi.number().min(0).precision(2).required(),
  date: Joi.date().iso().required(),
  location: Joi.string().allow('', null).max(120),
  note: Joi.string().allow('', null).max(300),
});

export const updateExpenseSchema = expenseSchema.fork(['category', 'amount', 'date'], (schema) => schema.optional()).min(1);

export const statusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Approved', 'Rejected', 'Paid').required(),
  adminComment: Joi.string().allow('', null).max(300),
});

export const reportQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  salesman: Joi.string().hex().length(24).optional(),
  category: Joi.string().optional(),
  format: Joi.string().valid('json', 'excel', 'pdf').optional(),
  interval: Joi.string().valid('weekly', 'monthly').default('monthly'),
});

export const userExpenseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid('Pending', 'Approved', 'Rejected', 'Paid').optional(),
  category: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  search: Joi.string().allow('', null).optional(),
});

export const adminExpenseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('Pending', 'Approved', 'Rejected', 'Paid').optional(),
  salesman: Joi.string().hex().length(24).optional(),
  category: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  search: Joi.string().allow('', null).optional(),
  interval: Joi.string().valid('weekly', 'monthly').optional(),
});

