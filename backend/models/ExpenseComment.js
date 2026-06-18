import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Expense } from './Expense.js';
import { Employee } from './Employee.js';

export const ExpenseComment = sequelize.define('ExpenseComment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  expenseId: { type: DataTypes.INTEGER, field: 'expense_id', references: { model: Expense, key: 'id' } },
  userId: { type: DataTypes.INTEGER, field: 'user_id', references: { model: Employee, key: 'id' } },
  comment: { type: DataTypes.TEXT, allowNull: false }
}, { tableName: 'expense_comments', timestamps: true });
