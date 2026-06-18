import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const ExpenseCategory = sequelize.define('ExpenseCategory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  limitAmount: { type: DataTypes.DOUBLE, field: 'limit_amount', defaultValue: 0.0 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'expense_categories', timestamps: true });
