import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';

export const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' }, allowNull: true }, // null means broadcast to all
  type: { type: DataTypes.STRING, defaultValue: 'info' }, // 'info', 'success', 'warning', 'error'
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, field: 'is_read', defaultValue: false }
}, { tableName: 'notifications', timestamps: true });
