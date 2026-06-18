import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const PayrollRun = sequelize.define('PayrollRun', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  month: { type: DataTypes.STRING, allowNull: false }, // Format: YYYY-MM
  totalEmployees: { type: DataTypes.INTEGER, field: 'total_employees', defaultValue: 0 },
  totalSalary: { type: DataTypes.DOUBLE, field: 'total_salary', defaultValue: 0 },
  totalDeduction: { type: DataTypes.DOUBLE, field: 'total_deduction', defaultValue: 0 },
  netPayout: { type: DataTypes.DOUBLE, field: 'net_payout', defaultValue: 0 },
  status: { 
    type: DataTypes.ENUM('Draft', 'Pending Approval', 'Approved', 'Processed', 'Paid'), 
    defaultValue: 'Draft' 
  },
  runDate: { type: DataTypes.DATE, field: 'run_date', defaultValue: DataTypes.NOW },
  processedBy: { type: DataTypes.STRING, field: 'processed_by' }
}, { tableName: 'payroll_runs', timestamps: true });
