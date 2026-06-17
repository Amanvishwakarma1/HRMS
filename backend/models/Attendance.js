import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';

export const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  checkInTime: { type: DataTypes.DATE, field: 'check_in_time', allowNull: false },
  checkOutTime: { type: DataTypes.DATE, field: 'check_out_time' },
  totalHours: { type: DataTypes.DOUBLE, field: 'total_hours' },
  status: { type: DataTypes.ENUM('Present', 'Absent', 'Late'), defaultValue: 'Present' },
  latitude: { type: DataTypes.DOUBLE, allowNull: false },
  longitude: { type: DataTypes.DOUBLE, allowNull: false },
  geofenceVerified: { type: DataTypes.BOOLEAN, field: 'geofence_verified', defaultValue: true }
}, { tableName: 'attendance', timestamps: false });