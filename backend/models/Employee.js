import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.STRING, defaultValue: 'Employee' },
  password: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING },
  designation: { type: DataTypes.STRING },
  bankName: { type: DataTypes.STRING, field: 'bank_name' },
  accountNumber: { type: DataTypes.STRING, field: 'account_number' },
  ifscCode: { type: DataTypes.STRING, field: 'ifsc_code' },
  pan: { type: DataTypes.STRING, field: 'pan_number' },
  uan: { type: DataTypes.STRING },
  pfNumber: { type: DataTypes.STRING, field: 'pf_number' },
  joinDate: { type: DataTypes.DATEONLY, field: 'join_date' },
  managerId: { type: DataTypes.INTEGER, field: 'manager_id' },
  status: { type: DataTypes.STRING, defaultValue: 'Active' },
  gender: { type: DataTypes.STRING, defaultValue: 'Male' },
  employmentType: { type: DataTypes.STRING, field: 'employment_type', defaultValue: 'Permanent' },
  trackingEnabled: { type: DataTypes.BOOLEAN, field: 'tracking_enabled', defaultValue: true }
}, { tableName: 'employees', timestamps: false });