import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';

export const LeaveRequest = sequelize.define('LeaveRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  type: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.DATEONLY, field: 'start_date', allowNull: false },
  endDate: { type: DataTypes.DATEONLY, field: 'end_date', allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' }, // 'Pending', 'Approved', 'Rejected', 'Need Information', 'Cancelled'
  approvedBy: { type: DataTypes.INTEGER, field: 'approved_by', references: { model: Employee, key: 'id' } },
  rejectionReason: { type: DataTypes.TEXT, field: 'rejection_reason' },
  requestMessage: { type: DataTypes.TEXT, field: 'request_message' }
}, { tableName: 'leave_requests', timestamps: true });
