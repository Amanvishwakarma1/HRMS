import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';

export const TaxDeclaration = sequelize.define('TaxDeclaration', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  financialYear: { type: DataTypes.STRING, field: 'financial_year', allowNull: false }, // e.g. 2026-2027
  category: { 
    type: DataTypes.ENUM('80C', '80D', 'HRA', 'NPS', 'Home Loan', 'Education Loan'), 
    allowNull: false 
  },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  status: { 
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), 
    defaultValue: 'Pending' 
  },
  proofUrl: { type: DataTypes.STRING, field: 'proof_url' },
  declarationDate: { type: DataTypes.DATE, field: 'declaration_date', defaultValue: DataTypes.NOW }
}, { tableName: 'tax_declarations', timestamps: true });
