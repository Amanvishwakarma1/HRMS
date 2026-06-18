import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';
import { ExpenseCategory } from './ExpenseCategory.js';

export const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  categoryId: { type: DataTypes.INTEGER, field: 'category_id', references: { model: ExpenseCategory, key: 'id' } },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  expenseDate: { type: DataTypes.DATEONLY, field: 'expense_date', allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'INR' },
  project: { type: DataTypes.STRING },
  paymentMethod: { type: DataTypes.STRING, field: 'payment_method' },
  location: { type: DataTypes.STRING },
  status: { 
    type: DataTypes.STRING,
    defaultValue: 'Draft' 
  },
  rejectionReason: { type: DataTypes.TEXT, field: 'rejection_reason' },
  requestMessage: { type: DataTypes.TEXT, field: 'request_message' },
  submittedAt: { type: DataTypes.DATE, field: 'submitted_at' },
  approvedAt: { type: DataTypes.DATE, field: 'approved_at' },
  reimbursedAt: { type: DataTypes.DATE, field: 'reimbursed_at' }
}, { tableName: 'expenses', timestamps: true });
