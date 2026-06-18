import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';

export const Bonus = sequelize.define('Bonus', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  type: { 
    type: DataTypes.ENUM('Festival Bonus', 'Performance Bonus', 'Retention Bonus'), 
    allowNull: false 
  },
  month: { type: DataTypes.STRING, allowNull: false }, // YYYY-MM
  status: { 
    type: DataTypes.ENUM('Pending Approval', 'Approved', 'Paid', 'Rejected'), 
    defaultValue: 'Pending Approval' 
  },
  description: { type: DataTypes.STRING },
  assignedDate: { type: DataTypes.DATE, field: 'assigned_date', defaultValue: DataTypes.NOW }
}, { tableName: 'bonuses', timestamps: true });
