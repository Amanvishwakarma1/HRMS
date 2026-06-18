import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sequelize } from '../config/db.js';
import { Expense } from '../models/Expense.js';
import { ExpenseCategory } from '../models/ExpenseCategory.js';
import { ExpenseReceipt } from '../models/ExpenseReceipt.js';
import { ExpenseApproval } from '../models/ExpenseApproval.js';
import { ExpenseComment } from '../models/ExpenseComment.js';
import { Reimbursement } from '../models/Reimbursement.js';
import { Employee } from '../models/Employee.js';
import { AuditLog } from '../models/AuditLog.js';
import { readData, writeData } from '../db.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper: Log audit trail entries
const logAudit = async (req, action, oldValue = '', newValue = '') => {
  try {
    await AuditLog.create({
      action,
      userId: req.user?.id || 4,
      username: req.user?.username || 'employee',
      role: req.user?.role || 'employee',
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
      ipAddress: req.ip || '127.0.0.1'
    });
  } catch (err) {
    console.error('Audit logging failed:', err.message);
  }
};

// 1. Create a new Expense Claim (Default: Draft or Submitted)
export const createExpense = async (req, res) => {
  try {
    const { 
      title, categoryId, amount, expenseDate, currency, 
      project, description, paymentMethod, location, 
      receiptId, status 
    } = req.body;

    const employeeId = req.user.id; // Enforce logged-in ID

    // Input Validation
    if (!title || !categoryId || !amount || !expenseDate) {
      return res.status(400).json({ success: false, message: 'Title, Category, Amount, and Date are required.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Expense amount must be greater than zero.' });
    }

    const expDate = new Date(expenseDate);
    if (isNaN(expDate.getTime()) || expDate > new Date()) {
      return res.status(400).json({ success: false, message: 'Expense date must be a valid date in the past.' });
    }

    // Limit check & High-amount Auto-flagging (e.g. amount > 10,000 INR)
    const convertedAmount = Number(amount);
    let flagged = false;
    if (convertedAmount > 10000) {
      flagged = true;
    }

    // Category Limit Verification
    const category = await ExpenseCategory.findByPk(categoryId);
    if (category && category.limitAmount > 0 && convertedAmount > category.limitAmount) {
      flagged = true;
    }

    // Prevent duplicate submission checks (recent check within 1 minute of same title, amount, employee)
    const duplicate = await Expense.findOne({
      where: {
        employeeId,
        title,
        amount: convertedAmount,
        expenseDate
      },
      order: [['createdAt', 'DESC']]
    });

    if (duplicate && (new Date() - new Date(duplicate.createdAt)) < 60000) {
      return res.status(409).json({ success: false, message: 'Duplicate expense submission detected within the last minute.' });
    }

    const targetStatus = status === 'Submitted' ? 'Submitted' : 'Draft';
    const submittedAt = targetStatus === 'Submitted' ? new Date() : null;

    const expense = await Expense.create({
      employeeId,
      categoryId,
      title,
      description,
      amount: convertedAmount,
      expenseDate,
      currency: currency || 'INR',
      project,
      paymentMethod,
      location,
      status: targetStatus,
      submittedAt
    });

    // Link receipt if receiptId is provided
    if (receiptId) {
      const receipt = await ExpenseReceipt.findByPk(receiptId);
      if (receipt) {
        await receipt.update({ expenseId: expense.id });
      }
    }

    // Track Audit Log
    await logAudit(req, `Create Expense (${targetStatus})`, '', expense.get({ plain: true }));

    res.status(201).json({ 
      success: true, 
      data: expense, 
      flagged,
      message: targetStatus === 'Submitted' 
        ? 'Expense claim submitted successfully!' 
        : 'Expense claim saved as draft.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Fetch Expenses list with dynamic RBAC isolation
export const getExpenses = async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    const employeeId = req.user.id;
    let whereClause = {};

    if (role === 'employee') {
      // Employees only see their own expenses
      whereClause.employeeId = employeeId;
    } else if (role === 'manager') {
      // Managers see reporting employees plus their own
      const teamQuery = `
        SELECT id FROM employees WHERE manager_id = :managerId
      `;
      const teamEmployees = await sequelize.query(teamQuery, {
        replacements: { managerId: employeeId },
        type: sequelize.QueryTypes.SELECT
      });
      const teamIds = teamEmployees.map(e => e.id);
      teamIds.push(employeeId); // Include self
      whereClause.employeeId = teamIds;
    }
    // Admin, HR, Finance see all (no filter)

    const list = await Expense.findAll({
      where: whereClause,
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'name', 'email', 'department', 'designation'] },
        { model: ExpenseCategory, as: 'category' },
        { model: ExpenseReceipt, as: 'receipts' },
        { model: ExpenseApproval, as: 'approvals' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Fetch specific Expense Details (with comments and approvals timeline)
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role.toLowerCase();
    const employeeId = req.user.id;

    const expense = await Expense.findByPk(id, {
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'name', 'email', 'department', 'designation'] },
        { model: ExpenseCategory, as: 'category' },
        { model: ExpenseReceipt, as: 'receipts' },
        { 
          model: ExpenseApproval, 
          as: 'approvals',
          include: [{ model: Employee, attributes: ['name', 'role'] }] 
        },
        { 
          model: ExpenseComment, 
          as: 'comments',
          include: [{ model: Employee, attributes: ['name', 'role'] }] 
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    // Role-based security check
    if (role === 'employee' && expense.employeeId !== employeeId) {
      return res.status(403).json({ success: false, message: 'Access Denied: You cannot view another employee\'s expense details.' });
    }

    if (role === 'manager') {
      const isReporting = await Employee.findOne({
        where: { id: expense.employeeId, managerId: employeeId }
      });
      if (!isReporting && expense.employeeId !== employeeId) {
        return res.status(403).json({ success: false, message: 'Access Denied: This employee does not report to you.' });
      }
    }

    // Query Manager Name
    let managerName = 'N/A';
    if (expense.employee?.id) {
      const empWithManager = await sequelize.query(
        'SELECT m.name FROM employees e LEFT JOIN employees m ON e.manager_id = m.id WHERE e.id = :empId',
        { replacements: { empId: expense.employee.id }, type: sequelize.QueryTypes.SELECT }
      );
      if (empWithManager && empWithManager[0]?.name) {
        managerName = empWithManager[0].name;
      }
    }

    const responseData = {
      ...expense.get({ plain: true }),
      managerName
    };

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Draft Expense (Only Draft is editable)
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, categoryId, amount, expenseDate, currency, project, description, paymentMethod, location } = req.body;
    const employeeId = req.user.id;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    // Security check
    if (expense.employeeId !== employeeId) {
      return res.status(403).json({ success: false, message: 'Access Denied: You cannot edit another employee\'s expense.' });
    }

    if (expense.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Only Draft claims can be edited.' });
    }

    const oldVal = expense.get({ plain: true });

    await expense.update({
      title,
      categoryId,
      amount,
      expenseDate,
      currency,
      project,
      description,
      paymentMethod,
      location
    });

    await logAudit(req, 'Edit Expense', oldVal, expense.get({ plain: true }));

    res.status(200).json({ success: true, data: expense, message: 'Expense updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete Draft Expense (Only Draft is deletable)
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.id;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    if (expense.employeeId !== employeeId) {
      return res.status(403).json({ success: false, message: 'Access Denied: You cannot delete another employee\'s expense.' });
    }

    if (expense.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Only Draft claims can be deleted.' });
    }

    const oldVal = expense.get({ plain: true });
    await expense.destroy();

    await logAudit(req, 'Delete Expense', oldVal, '');

    res.status(200).json({ success: true, message: 'Expense claim deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Submit Draft Expense
export const submitExpenseClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.id;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    if (expense.employeeId !== employeeId) {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }

    if (expense.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Claim is already submitted.' });
    }

    const oldVal = expense.get({ plain: true });
    await expense.update({
      status: 'Submitted',
      submittedAt: new Date()
    });

    await logAudit(req, 'Submit Expense', oldVal, expense.get({ plain: true }));

    res.status(200).json({ success: true, data: expense, message: 'Expense claim submitted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Notification Helper
const sendNotification = (userId, type, title, message) => {
  try {
    const db = readData();
    db.notifications.unshift({
      id: String(Date.now()) + Math.random().toString(36).substring(2, 5),
      userId: userId ? Number(userId) : null,
      type: type || 'info',
      title,
      message,
      time: 'Just now',
      isRead: false
    });
    writeData(db);
  } catch (err) {
    console.error('Failed to trigger notification:', err.message);
  }
};

// 7a. Get Pending Approvals (Guarded by HR / Finance / Admin roles)
export const getPendingApprovals = async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    let whereClause = {};

    if (role === 'hr' || role === 'admin') {
      whereClause.status = ['Submitted', 'Resubmitted'];
    } else if (role === 'finance') {
      whereClause.status = 'HR Approved';
    } else if (role === 'manager') {
      // Fallback: managers see Submitted team claims
      const teamQuery = `SELECT id FROM employees WHERE manager_id = :managerId`;
      const teamEmployees = await sequelize.query(teamQuery, {
        replacements: { managerId: req.user.id },
        type: sequelize.QueryTypes.SELECT
      });
      const teamIds = teamEmployees.map(e => e.id);
      whereClause.employeeId = teamIds;
      whereClause.status = ['Submitted', 'Resubmitted'];
    } else {
      return res.status(403).json({ success: false, message: 'Access Denied: Approvals queue is only accessible by HR, Finance, or Admin.' });
    }

    const list = await Expense.findAll({
      where: whereClause,
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'name', 'email', 'department', 'designation'] },
        { model: ExpenseCategory, as: 'category' },
        { model: ExpenseReceipt, as: 'receipts' },
        { model: ExpenseApproval, as: 'approvals' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7b. Get Approval History for a Claim
export const getApprovalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id, {
      include: [
        { 
          model: ExpenseApproval, 
          as: 'approvals',
          include: [{ model: Employee, attributes: ['name', 'role'] }]
        },
        { 
          model: ExpenseComment, 
          as: 'comments',
          include: [{ model: Employee, attributes: ['name', 'role'] }]
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    // Combine approvals and comments history chronologically
    const history = [
      ...(expense.approvals || []).map(a => ({
        type: 'approval',
        id: a.id,
        user: a.Employee?.name || 'Approver',
        role: a.role,
        status: a.status,
        comments: a.comments,
        date: a.createdAt
      })),
      ...(expense.comments || []).map(c => ({
        type: 'comment',
        id: c.id,
        user: c.Employee?.name || 'Commenter',
        role: c.Employee?.role || 'User',
        comment: c.comment,
        date: c.createdAt
      }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7c. Request More Information (HR Only)
export const requestInformation = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, requestMessage } = req.body;
    const approverId = req.user.id;
    const role = req.user.role.toLowerCase();

    if (role !== 'hr' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied: Only HR or Admin can request more information.' });
    }

    const message = requestMessage || comments;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Information request message is required.' });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    if (expense.status !== 'Submitted' && expense.status !== 'Resubmitted') {
      return res.status(400).json({ success: false, message: 'Expense is not pending HR review.' });
    }

    const oldStatus = expense.status;

    await expense.update({
      status: 'Need Information',
      requestMessage: message
    });

    await ExpenseApproval.create({
      expenseId: expense.id,
      approverId,
      role: req.user.role,
      status: 'Need Information',
      comments: message
    });

    await ExpenseComment.create({
      expenseId: expense.id,
      userId: approverId,
      comment: `Information Requested: ${message}`
    });

    // Notify Employee
    sendNotification(expense.employeeId, 'warning', 'More Information Needed on Expense', `HR has requested clarification on EXP-${expense.id}: "${message}"`);

    await logAudit(req, 'Request More Information', { status: oldStatus }, { status: 'Need Information', requestMessage: message });

    res.status(200).json({ success: true, data: expense, message: 'Information request submitted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7d. Resubmit Expense (Employee Only)
export const resubmitExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, categoryId, amount, expenseDate, currency, project, description, paymentMethod, location, receiptId } = req.body;
    const employeeId = req.user.id;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    if (expense.employeeId !== employeeId) {
      return res.status(403).json({ success: false, message: 'Access Denied: You cannot edit another employee\'s expense.' });
    }

    if (expense.status !== 'Need Information') {
      return res.status(400).json({ success: false, message: 'Only claims with status "Need Information" can be resubmitted.' });
    }

    const oldStatus = expense.status;

    await expense.update({
      title: title || expense.title,
      categoryId: categoryId || expense.categoryId,
      amount: amount ? Number(amount) : expense.amount,
      expenseDate: expenseDate || expense.expenseDate,
      currency: currency || expense.currency,
      project: project || expense.project,
      description: description || expense.description,
      paymentMethod: paymentMethod || expense.paymentMethod,
      location: location || expense.location,
      status: 'Resubmitted',
      requestMessage: null
    });

    if (receiptId) {
      const receipt = await ExpenseReceipt.findByPk(receiptId);
      if (receipt) {
        await receipt.update({ expenseId: expense.id });
      }
    }

    await ExpenseApproval.create({
      expenseId: expense.id,
      approverId: employeeId,
      role: 'Employee',
      status: 'Resubmitted',
      comments: 'Resubmitted with updated details.'
    });

    await ExpenseComment.create({
      expenseId: expense.id,
      userId: employeeId,
      comment: 'Resubmitted with updated details.'
    });

    // Notify HR
    sendNotification(null, 'info', 'Expense Resubmitted', `${req.user.username} has resubmitted claim EXP-${expense.id} with updates.`);

    await logAudit(req, 'Resubmit Expense', { status: oldStatus }, { status: 'Resubmitted' });

    res.status(200).json({ success: true, data: expense, message: 'Expense claim successfully resubmitted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Approve Expense (HR or Finance or Admin)
export const approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, approvedAmount, financeNotes } = req.body;
    const approverId = req.user.id;
    const role = req.user.role.toLowerCase();

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    let nextStatus = '';
    if (role === 'hr' || role === 'admin') {
      if (expense.status !== 'Submitted' && expense.status !== 'Resubmitted') {
        return res.status(400).json({ success: false, message: 'Expense must be in Submitted or Resubmitted status.' });
      }
      nextStatus = 'HR Approved';
    } else if (role === 'finance') {
      if (expense.status !== 'HR Approved') {
        return res.status(400).json({ success: false, message: 'Expense must be HR Approved first.' });
      }
      nextStatus = 'Finance Approved';
    } else {
      return res.status(403).json({ success: false, message: 'Access Denied: Unauthorized role for approvals.' });
    }

    const oldStatus = expense.status;

    await expense.update({
      status: nextStatus,
      approvedAt: nextStatus === 'Finance Approved' ? new Date() : expense.approvedAt
    });

    // Write to approvals history
    await ExpenseApproval.create({
      expenseId: expense.id,
      approverId,
      role: req.user.role,
      status: nextStatus,
      comments: comments || (financeNotes ? `Finance Notes: ${financeNotes}` : 'Approved')
    });

    if (comments) {
      await ExpenseComment.create({
        expenseId: expense.id,
        userId: approverId,
        comment: comments
      });
    }

    // Notifications and Reimbursement records
    if (nextStatus === 'HR Approved') {
      sendNotification(expense.employeeId, 'success', 'Expense HR Approved', `Your claim EXP-${expense.id} was approved by HR and sent to Finance.`);
      sendNotification(null, 'info', 'New Claim Pending Finance Verification', `Claim EXP-${expense.id} has been approved by HR and is pending your review.`);
    } else if (nextStatus === 'Finance Approved') {
      sendNotification(expense.employeeId, 'success', 'Expense Finance Approved', `Your claim EXP-${expense.id} was approved by Finance.`);
      
      // Auto create Reimbursement entry
      const finalApprovedAmount = approvedAmount !== undefined ? Number(approvedAmount) : expense.amount;
      const monthStr = new Date(expense.expenseDate).toISOString().slice(0, 7);
      
      const categoryMap = {
        'Travel': 'Travel',
        'Food': 'Food',
        'Fuel': 'Fuel',
        'Internet': 'Internet',
        'Medical': 'Medical'
      };
      const categoryName = await ExpenseCategory.findByPk(expense.categoryId);
      const matchedCategory = categoryMap[categoryName?.name] || 'Other';

      await Reimbursement.create({
        employeeId: expense.employeeId,
        amount: finalApprovedAmount,
        approvedAmount: finalApprovedAmount,
        category: matchedCategory,
        month: monthStr,
        status: 'Approved',
        description: `Expense Reimbursement: ${expense.title}`,
        expenseId: expense.id,
        paymentStatus: 'Pending'
      });
    }

    await logAudit(req, `Approve Expense (${nextStatus})`, { status: oldStatus }, { status: nextStatus, comments });

    res.status(200).json({ success: true, data: expense, message: `Expense status updated to ${nextStatus}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Reject Expense (HR or Finance or Admin)
export const rejectExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, rejectionReason } = req.body;
    const approverId = req.user.id;
    const role = req.user.role.toLowerCase();

    if (role !== 'hr' && role !== 'finance' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied: Unauthorized role.' });
    }

    const finalReason = rejectionReason || comments;
    if (!finalReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    const oldStatus = expense.status;

    await expense.update({
      status: 'Rejected',
      rejectionReason: finalReason
    });

    await ExpenseApproval.create({
      expenseId: expense.id,
      approverId,
      role: req.user.role,
      status: 'Rejected',
      comments: finalReason
    });

    await ExpenseComment.create({
      expenseId: expense.id,
      userId: approverId,
      comment: `Rejected: ${finalReason}`
    });

    // Notify Employee
    sendNotification(expense.employeeId, 'error', 'Expense Rejected', `Your expense claim EXP-${expense.id} was rejected. Reason: ${finalReason}`);

    await logAudit(req, 'Reject Expense', { status: oldStatus }, { status: 'Rejected', rejectionReason: finalReason });

    res.status(200).json({ success: true, data: expense, message: 'Expense claim has been rejected.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8b. Bulk Approve Expenses
export const bulkApprove = async (req, res) => {
  try {
    const { ids } = req.body;
    const approverId = req.user.id;
    const role = req.user.role.toLowerCase();

    if (role !== 'hr' && role !== 'finance' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied: Unauthorized role.' });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Expense IDs array is required.' });
    }

    const updated = [];
    const errors = [];

    for (const id of ids) {
      try {
        const expense = await Expense.findByPk(id);
        if (!expense) {
          errors.push({ id, message: 'Not found.' });
          continue;
        }

        let nextStatus = '';
        if (role === 'hr' || role === 'admin') {
          if (expense.status !== 'Submitted' && expense.status !== 'Resubmitted') {
            errors.push({ id, message: 'Must be in Submitted or Resubmitted status.' });
            continue;
          }
          nextStatus = 'HR Approved';
        } else if (role === 'finance') {
          if (expense.status !== 'HR Approved') {
            errors.push({ id, message: 'Must be HR Approved first.' });
            continue;
          }
          nextStatus = 'Finance Approved';
        }

        const oldStatus = expense.status;

        await expense.update({
          status: nextStatus,
          approvedAt: nextStatus === 'Finance Approved' ? new Date() : expense.approvedAt
        });

        await ExpenseApproval.create({
          expenseId: expense.id,
          approverId,
          role: req.user.role,
          status: nextStatus,
          comments: 'Bulk Approved'
        });

        if (nextStatus === 'HR Approved') {
          sendNotification(expense.employeeId, 'success', 'Expense HR Approved', `Your claim EXP-${expense.id} was approved by HR (Bulk).`);
          sendNotification(null, 'info', 'New Claim Pending Finance Verification', `Claim EXP-${expense.id} approved by HR (Bulk).`);
        } else if (nextStatus === 'Finance Approved') {
          sendNotification(expense.employeeId, 'success', 'Expense Finance Approved', `Your claim EXP-${expense.id} was approved by Finance (Bulk).`);
          
          const finalApprovedAmount = expense.amount;
          const monthStr = new Date(expense.expenseDate).toISOString().slice(0, 7);
          
          const categoryName = await ExpenseCategory.findByPk(expense.categoryId);
          const matchedCategory = categoryName?.name === 'Travel' ? 'Travel' :
                                  categoryName?.name === 'Food' ? 'Food' :
                                  categoryName?.name === 'Fuel' ? 'Fuel' :
                                  categoryName?.name === 'Internet' ? 'Internet' : 'Other';

          await Reimbursement.create({
            employeeId: expense.employeeId,
            amount: finalApprovedAmount,
            approvedAmount: finalApprovedAmount,
            category: matchedCategory,
            month: monthStr,
            status: 'Approved',
            description: `Expense Reimbursement: ${expense.title} (Bulk)`,
            expenseId: expense.id,
            paymentStatus: 'Pending'
          });
        }

        await logAudit(req, `Bulk Approve Expense (${nextStatus})`, { status: oldStatus }, { status: nextStatus });
        updated.push(id);
      } catch (err) {
        errors.push({ id, message: err.message });
      }
    }

    res.status(200).json({ success: true, updated, errors, message: `Successfully approved ${updated.length} of ${ids.length} claims.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8c. Bulk Reject Expenses
export const bulkReject = async (req, res) => {
  try {
    const { ids, rejectionReason, comments } = req.body;
    const approverId = req.user.id;
    const role = req.user.role.toLowerCase();

    if (role !== 'hr' && role !== 'finance' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied: Unauthorized role.' });
    }

    const finalReason = rejectionReason || comments || 'Bulk Rejected';
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Expense IDs array is required.' });
    }

    const updated = [];
    const errors = [];

    for (const id of ids) {
      try {
        const expense = await Expense.findByPk(id);
        if (!expense) {
          errors.push({ id, message: 'Not found.' });
          continue;
        }

        if (expense.status === 'Draft' || expense.status === 'Rejected' || expense.status === 'Reimbursed' || expense.status === 'Paid') {
          errors.push({ id, message: `Cannot reject in status: ${expense.status}` });
          continue;
        }

        const oldStatus = expense.status;

        await expense.update({
          status: 'Rejected',
          rejectionReason: finalReason
        });

        await ExpenseApproval.create({
          expenseId: expense.id,
          approverId,
          role: req.user.role,
          status: 'Rejected',
          comments: finalReason
        });

        await ExpenseComment.create({
          expenseId: expense.id,
          userId: approverId,
          comment: `Rejected in Bulk: ${finalReason}`
        });

        sendNotification(expense.employeeId, 'error', 'Expense Rejected', `Your expense claim EXP-${expense.id} was rejected (Bulk). Reason: ${finalReason}`);

        await logAudit(req, 'Bulk Reject Expense', { status: oldStatus }, { status: 'Rejected', rejectionReason: finalReason });
        updated.push(id);
      } catch (err) {
        errors.push({ id, message: err.message });
      }
    }

    res.status(200).json({ success: true, updated, errors, message: `Successfully rejected ${updated.length} of ${ids.length} claims.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Reimburse Approved Expense (Finance only)
export const reimburseExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionReference } = req.body;
    const role = req.user.role.toLowerCase();

    if (role !== 'finance' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied: Finance authorization required.' });
    }

    if (!transactionReference) {
      return res.status(400).json({ success: false, message: 'Transaction reference code is required.' });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    if (expense.status !== 'Finance Approved') {
      return res.status(400).json({ success: false, message: 'Only fully approved expenses can be reimbursed.' });
    }

    const oldVal = expense.get({ plain: true });
    await expense.update({
      status: 'Reimbursed',
      reimbursedAt: new Date()
    });

    // Update the linked reimbursement entry
    const reimbursement = await Reimbursement.findOne({ where: { expenseId: expense.id } });
    if (reimbursement) {
      await reimbursement.update({
        status: 'Paid',
        paymentStatus: 'Paid',
        paymentDate: new Date(),
        transactionReference
      });
    }

    await logAudit(req, 'Reimburse Expense', oldVal, expense.get({ plain: true }));

    res.status(200).json({ success: true, data: expense, message: 'Expense claim marked as reimbursed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Base64 Receipt File Upload
export const uploadReceipt = async (req, res) => {
  try {
    const { filename, base64Data, fileType, fileSize } = req.body;

    if (!filename || !base64Data) {
      return res.status(400).json({ success: false, message: 'Filename and base64 file data are required.' });
    }

    // Supported formats check: PDF, JPG, JPEG, PNG
    const cleanFileType = fileType ? fileType.toLowerCase() : '';
    const cleanFilename = filename.toLowerCase();
    const isSupported = cleanFilename.endsWith('.pdf') || cleanFilename.endsWith('.jpg') || 
                        cleanFilename.endsWith('.jpeg') || cleanFilename.endsWith('.png') ||
                        cleanFileType.includes('pdf') || cleanFileType.includes('jpeg') || 
                        cleanFileType.includes('png') || cleanFileType.includes('jpg');

    if (!isSupported) {
      return res.status(400).json({ success: false, message: 'Unsupported receipt format. Only PDF, JPG, JPEG, and PNG are allowed.' });
    }

    // Size check (< 10 MB)
    const sizeInBytes = fileSize || Math.round((base64Data.length * 3) / 4);
    if (sizeInBytes > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size exceeds the 10 MB limit.' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let dataBuffer;
    if (matches) {
      dataBuffer = Buffer.from(matches[2], 'base64');
    } else {
      dataBuffer = Buffer.from(base64Data, 'base64');
    }

    const uniqueName = `${crypto.randomUUID()}-${filename.replace(/\s+/g, '_')}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);
    fs.writeFileSync(filePath, dataBuffer);

    // Save metadata in database with null expenseId (will link on submit)
    const fileUrl = `/uploads/${uniqueName}`;
    const receipt = await ExpenseReceipt.create({
      filename,
      fileUrl,
      fileType: fileType || 'image/png',
      fileSize: sizeInBytes
    });

    res.status(201).json({ 
      success: true, 
      data: receipt,
      message: 'Receipt uploaded successfully!' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. Retrieve Receipt Details
export const getReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await ExpenseReceipt.findByPk(id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }
    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 12. Delete Receipt File
export const deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await ExpenseReceipt.findByPk(id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    // Remove file from filesystem
    const filename = path.basename(receipt.fileUrl);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await receipt.destroy();
    res.status(200).json({ success: true, message: 'Receipt removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 13. Reports and Exports (PDF, CSV, Excel outputs)
export const getReports = async (req, res) => {
  try {
    const { startDate, endDate, categoryId, status, reimbursementStatus } = req.query;
    const role = req.user.role.toLowerCase();
    const employeeId = req.user.id;
    let whereClause = {};

    if (role === 'employee') {
      whereClause.employeeId = employeeId;
    }

    if (startDate && endDate) {
      whereClause.expenseDate = { [sequelize.Sequelize.Op.between]: [startDate, endDate] };
    }
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    if (status) {
      whereClause.status = status;
    }

    const expensesList = await Expense.findAll({
      where: whereClause,
      include: [
        { model: Employee, as: 'employee', attributes: ['name', 'email', 'department'] },
        { model: ExpenseCategory, as: 'category' }
      ],
      order: [['expenseDate', 'DESC']]
    });

    res.status(200).json({ success: true, data: expensesList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 14. Export endpoints helper
export const exportReport = async (req, res) => {
  try {
    const { format } = req.params; // 'csv', 'excel', 'pdf'
    const role = req.user.role.toLowerCase();
    const employeeId = req.user.id;
    let whereClause = {};

    if (role === 'employee') {
      whereClause.employeeId = employeeId;
    }

    const expensesList = await Expense.findAll({
      where: whereClause,
      include: [
        { model: Employee, as: 'employee', attributes: ['name', 'email', 'department'] },
        { model: ExpenseCategory, as: 'category' }
      ]
    });

    if (format === 'csv' || format === 'excel') {
      // Build standard CSV
      let csv = 'Expense ID,Employee,Category,Title,Amount,Currency,Date,Status,Project,Payment Method\n';
      expensesList.forEach(e => {
        csv += `${e.id},"${e.employee?.name || 'N/A'}","${e.category?.name || 'N/A'}","${e.title}",${e.amount},${e.currency},${e.expenseDate},${e.status},"${e.project || ''}","${e.paymentMethod || ''}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=Expense_Report_${Date.now()}.csv`);
      return res.status(200).send(csv);
    }

    // Default mock PDF response
    let reportText = `EXPENSE REPORT SUMMARY - Generated on ${new Date().toLocaleDateString()}\n\n`;
    expensesList.forEach(e => {
      reportText += `[EXP-${e.id}] ${e.expenseDate} - ${e.employee?.name} - ${e.category?.name} - ${e.title}: ${e.currency} ${e.amount} (${e.status})\n`;
    });
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=Expense_Report_${Date.now()}.txt`);
    res.status(200).send(reportText);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 15. Analytics breakdown summaries
export const getAnalytics = async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    const employeeId = req.user.id;
    let whereClause = {};

    if (role === 'employee') {
      whereClause.employeeId = employeeId;
    }

    const list = await Expense.findAll({
      where: whereClause,
      include: [{ model: ExpenseCategory, as: 'category' }]
    });

    // Grouping calculations
    const categoryBreakdown = {};
    const monthlyTrend = {};
    const statusDistribution = { Draft: 0, Submitted: 0, 'Manager Approved': 0, Approved: 0, Reimbursed: 0, Rejected: 0 };
    let totalReimbursed = 0;
    let pendingReimbursement = 0;
    let pendingApproval = 0;

    list.forEach(e => {
      // Category wise
      const catName = e.category?.name || 'Miscellaneous';
      categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + e.amount;

      // Monthly wise
      const month = e.expenseDate ? e.expenseDate.slice(0, 7) : 'Unknown';
      monthlyTrend[month] = (monthlyTrend[month] || 0) + e.amount;

      // Status
      if (statusDistribution[e.status] !== undefined) {
        statusDistribution[e.status]++;
      }

      // Reimbursements
      if (e.status === 'Reimbursed') {
        totalReimbursed += e.amount;
      } else if (e.status === 'Approved') {
        pendingReimbursement += e.amount;
      } else if (e.status === 'Submitted' || e.status === 'Manager Approved') {
        pendingApproval += e.amount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        categoryBreakdown,
        monthlyTrend,
        statusDistribution,
        summary: {
          totalExpenses: list.length,
          totalReimbursed,
          pendingReimbursement,
          pendingApproval
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 16. Admin API: Fetch all categories
export const getCategories = async (req, res) => {
  try {
    const list = await ExpenseCategory.findAll({ order: [['name', 'ASC']] });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 17. Admin API: Add category
export const createCategory = async (req, res) => {
  try {
    const { name, description, limitAmount } = req.body;
    const role = req.user.role.toLowerCase();

    if (role !== 'admin' && role !== 'hr') {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin role required.' });
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const category = await ExpenseCategory.create({
      name,
      description,
      limitAmount: limitAmount ? Number(limitAmount) : 0.0,
      active: true
    });

    await logAudit(req, 'Create Expense Category', '', category.get({ plain: true }));

    res.status(201).json({ success: true, data: category, message: 'Expense category added successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 18. Add comment on expense claim
export const addExpenseComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found.' });
    }

    const commentRecord = await ExpenseComment.create({
      expenseId: expense.id,
      userId,
      comment
    });

    await logAudit(req, 'Add Expense Comment', '', commentRecord.get({ plain: true }));

    res.status(201).json({ success: true, data: commentRecord, message: 'Comment added successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
