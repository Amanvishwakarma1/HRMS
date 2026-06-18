import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Expense } from './Expense.js';

export const ExpenseReceipt = sequelize.define('ExpenseReceipt', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  expenseId: { type: DataTypes.INTEGER, field: 'expense_id', references: { model: Expense, key: 'id' } },
  filename: { type: DataTypes.STRING, allowNull: false },
  fileUrl: { type: DataTypes.STRING, field: 'file_url', allowNull: false },
  fileType: { type: DataTypes.STRING, field: 'file_type' },
  fileSize: { type: DataTypes.INTEGER, field: 'file_size' }
}, { tableName: 'expense_receipts', timestamps: true });
