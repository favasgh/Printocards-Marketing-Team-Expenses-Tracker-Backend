import { Router } from 'express';
import { createExpense, deleteExpense, getMyExpenses, updateExpense } from '../controllers/expenseController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import validateRequest from '../middleware/validateRequest.js';
import { expenseSchema, updateExpenseSchema, userExpenseQuerySchema } from '../validators/expenseValidators.js';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('image'), validateRequest(expenseSchema), createExpense);
router.get('/', validateRequest(userExpenseQuerySchema, 'query'), getMyExpenses);
router.put('/:id', upload.single('image'), validateRequest(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);

export default router;


