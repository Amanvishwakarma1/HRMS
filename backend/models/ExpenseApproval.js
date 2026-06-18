import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Expense } from './Expense.js';
import { Employee } from './Employee.js';

export const ExpenseApproval = sequelize.define('ExpenseApproval', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  expenseId: { type: DataTypes.INTEGER, field: 'expense_id', references: { model: Expense, key: 'id' } },
  approverId: { type: DataTypes.INTEGER, field: 'approver_id', references: { model: Employee, key: 'id' } },
  role: { type: DataTypes.STRING, allowNull: false }, // 'Manager' or 'Finance'
  status: { type: DataTypes.STRING, allowNull: false }, // 'Approved' or 'Rejected'
  comments: { type: DataTypes.TEXT }
}, { tableName: 'expense_approvals', timestamps: true });
