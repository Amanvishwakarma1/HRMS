import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';

export const Reimbursement = sequelize.define('Reimbursement', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  category: { 
    type: DataTypes.ENUM('Travel', 'Food', 'Fuel', 'Internet', 'Medical', 'Other'), 
    allowNull: false 
  },
  month: { type: DataTypes.STRING, allowNull: false }, // YYYY-MM
  status: { 
    type: DataTypes.ENUM('Submitted', 'Pending', 'Approved', 'Rejected', 'Paid'), 
    defaultValue: 'Submitted' 
  },
  description: { type: DataTypes.STRING },
  billUrl: { type: DataTypes.STRING, field: 'bill_url' },
  claimDate: { type: DataTypes.DATE, field: 'claim_date', defaultValue: DataTypes.NOW },
  
  // Linked expense details
  expenseId: { type: DataTypes.INTEGER, field: 'expense_id', references: { model: 'expenses', key: 'id' }, allowNull: true },
  approvedAmount: { type: DataTypes.DOUBLE, field: 'approved_amount', allowNull: true },
  paymentDate: { type: DataTypes.DATE, field: 'payment_date', allowNull: true },
  paymentStatus: { 
    type: DataTypes.ENUM('Pending', 'Processing', 'Paid', 'Failed', 'Cancelled'), 
    field: 'payment_status',
    defaultValue: 'Pending',
    allowNull: true
  },
  transactionReference: { type: DataTypes.STRING, field: 'transaction_reference', allowNull: true }
}, { tableName: 'reimbursements', timestamps: true });
