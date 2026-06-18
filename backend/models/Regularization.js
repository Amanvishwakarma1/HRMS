import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';
import { Attendance } from './Attendance.js';

export const Regularization = sequelize.define('Regularization', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  attendanceId: { type: DataTypes.INTEGER, field: 'attendance_id', references: { model: Attendance, key: 'id' }, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  requestedCheckIn: { type: DataTypes.STRING, field: 'requested_check_in' },
  requestedCheckOut: { type: DataTypes.STRING, field: 'requested_check_out' },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' } // 'Pending', 'Approved', 'Rejected'
}, { tableName: 'regularizations', timestamps: true });
