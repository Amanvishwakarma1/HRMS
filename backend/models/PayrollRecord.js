import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';
import { PayrollRun } from './PayrollRun.js';

export const PayrollRecord = sequelize.define('PayrollRecord', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  payrollRunId: { type: DataTypes.INTEGER, field: 'payroll_run_id', references: { model: PayrollRun, key: 'id' } },
  month: { type: DataTypes.STRING, allowNull: false },
  basicPay: { type: DataTypes.DOUBLE, field: 'basic_pay', defaultValue: 0 },
  hra: { type: DataTypes.DOUBLE, defaultValue: 0 },
  conveyance: { type: DataTypes.DOUBLE, defaultValue: 0 },
  medical: { type: DataTypes.DOUBLE, defaultValue: 0 },
  specialAllowance: { type: DataTypes.DOUBLE, field: 'special_allowance', defaultValue: 0 },
  otherAllowance: { type: DataTypes.DOUBLE, field: 'other_allowance', defaultValue: 0 },
  lopDays: { type: DataTypes.INTEGER, field: 'lop_days', defaultValue: 0 },
  lopAmount: { type: DataTypes.DOUBLE, field: 'lop_amount', defaultValue: 0 },
  pf: { type: DataTypes.DOUBLE, defaultValue: 0 },
  esi: { type: DataTypes.DOUBLE, defaultValue: 0 },
  professionalTax: { type: DataTypes.DOUBLE, field: 'professional_tax', defaultValue: 0 },
  tds: { type: DataTypes.DOUBLE, defaultValue: 0 },
  bonus: { type: DataTypes.DOUBLE, defaultValue: 0 },
  reimbursement: { type: DataTypes.DOUBLE, defaultValue: 0 },
  grossSalary: { type: DataTypes.DOUBLE, field: 'gross_salary', defaultValue: 0 },
  deductions: { type: DataTypes.DOUBLE, defaultValue: 0 },
  netSalary: { type: DataTypes.DOUBLE, field: 'net_salary', defaultValue: 0 },
  status: { 
    type: DataTypes.ENUM('Draft', 'Pending Approval', 'Approved', 'Processed', 'Paid'), 
    defaultValue: 'Draft' 
  },
  pdfUrl: { type: DataTypes.STRING, field: 'pdf_url' },
  digitalSignature: { type: DataTypes.STRING, field: 'digital_signature' },
  qrCodeData: { type: DataTypes.TEXT, field: 'qr_code_data' }
}, { tableName: 'payroll_records', timestamps: true });
