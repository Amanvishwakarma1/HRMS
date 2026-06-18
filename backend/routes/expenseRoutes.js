import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  submitExpenseClaim,
  approveExpense,
  rejectExpense,
  reimburseExpense,
  uploadReceipt,
  getReceipt,
  deleteReceipt,
  getReports,
  exportReport,
  getAnalytics,
  getCategories,
  createCategory,
  addExpenseComment,
  getPendingApprovals,
  getApprovalHistory,
  requestInformation,
  resubmitExpense,
  bulkApprove,
  bulkReject
} from '../controllers/expenseController.js';

const router = express.Router();

// New approvals workflow endpoints (MUST be declared before dynamic :id routes to prevent parameter capture collisions)
router.get('/pending-approval', authenticateToken, getPendingApprovals);
router.get('/approval-history/:id', authenticateToken, getApprovalHistory);
router.post('/bulk-approve', authenticateToken, bulkApprove);
router.post('/bulk-reject', authenticateToken, bulkReject);

// Expense CRUD operations
router.post('/', authenticateToken, createExpense);
router.get('/', authenticateToken, getExpenses);
router.get('/analytics', authenticateToken, getAnalytics);
router.get('/reports', authenticateToken, getReports);
router.get('/export/:format', authenticateToken, exportReport);
router.get('/categories', authenticateToken, getCategories);
router.post('/categories', authenticateToken, createCategory);

router.get('/:id', authenticateToken, getExpenseById);
router.put('/:id', authenticateToken, updateExpense);
router.delete('/:id', authenticateToken, deleteExpense);

// Workflow state transition triggers
router.post('/:id/submit', authenticateToken, submitExpenseClaim);
router.post('/:id/approve', authenticateToken, approveExpense);
router.post('/:id/reject', authenticateToken, rejectExpense);
router.post('/:id/reimburse', authenticateToken, reimburseExpense);
router.post('/:id/comment', authenticateToken, addExpenseComment);
router.post('/:id/request-info', authenticateToken, requestInformation);
router.post('/:id/resubmit', authenticateToken, resubmitExpense);

// Receipt management endpoints
router.post('/upload', authenticateToken, uploadReceipt);
router.get('/receipt/:id', authenticateToken, getReceipt);
router.delete('/receipt/:id', authenticateToken, deleteReceipt);

export default router;
