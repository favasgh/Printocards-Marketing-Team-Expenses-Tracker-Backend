import { Router } from 'express';
import { getAllExpenses, getReports, getSalesmen, getSalesmanSummary, updateExpenseStatus } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { adminExpenseQuerySchema, reportQuerySchema, statusSchema } from '../validators/expenseValidators.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/expenses', validateRequest(adminExpenseQuerySchema, 'query'), getAllExpenses);
router.put('/expenses/:id', validateRequest(statusSchema), updateExpenseStatus);
router.get('/reports', validateRequest(reportQuerySchema, 'query'), getReports);
router.get('/salesmen', getSalesmen);
router.get('/salesmen/summary', getSalesmanSummary);

export default router;


