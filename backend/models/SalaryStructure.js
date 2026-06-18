import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';

export const SalaryStructure = sequelize.define('SalaryStructure', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', unique: true, references: { model: Employee, key: 'id' } },
  basicPay: { type: DataTypes.DOUBLE, field: 'basic_pay', defaultValue: 0 },
  hra: { type: DataTypes.DOUBLE, defaultValue: 0 },
  conveyance: { type: DataTypes.DOUBLE, defaultValue: 0 },
  medical: { type: DataTypes.DOUBLE, defaultValue: 0 },
  specialAllowance: { type: DataTypes.DOUBLE, field: 'special_allowance', defaultValue: 0 },
  otherAllowance: { type: DataTypes.DOUBLE, field: 'other_allowance', defaultValue: 0 },
  pf: { type: DataTypes.DOUBLE, defaultValue: 0 }, // employee PF contribution
  esi: { type: DataTypes.DOUBLE, defaultValue: 0 },
  professionalTax: { type: DataTypes.DOUBLE, field: 'professional_tax', defaultValue: 200 }
}, { tableName: 'salary_structures', timestamps: true });

export const SalaryStructureHistory = sequelize.define('SalaryStructureHistory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  basicPay: { type: DataTypes.DOUBLE, field: 'basic_pay', defaultValue: 0 },
  hra: { type: DataTypes.DOUBLE, defaultValue: 0 },
  conveyance: { type: DataTypes.DOUBLE, defaultValue: 0 },
  medical: { type: DataTypes.DOUBLE, defaultValue: 0 },
  specialAllowance: { type: DataTypes.DOUBLE, field: 'special_allowance', defaultValue: 0 },
  otherAllowance: { type: DataTypes.DOUBLE, field: 'other_allowance', defaultValue: 0 },
  pf: { type: DataTypes.DOUBLE, defaultValue: 0 },
  esi: { type: DataTypes.DOUBLE, defaultValue: 0 },
  professionalTax: { type: DataTypes.DOUBLE, field: 'professional_tax', defaultValue: 200 },
  changeReason: { type: DataTypes.STRING, field: 'change_reason' }
}, { tableName: 'salary_structure_history', timestamps: true });
