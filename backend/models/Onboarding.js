import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Employee } from './Employee.js';

export const Onboarding = sequelize.define('Onboarding', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, field: 'employee_id', references: { model: Employee, key: 'id' } },
  status: { type: DataTypes.STRING, defaultValue: 'Document Pending' }, // 'Document Pending', 'Verification Pending', 'Training Pending', 'Completed'
  onboardingPeriodDays: { type: DataTypes.INTEGER, field: 'onboarding_period_days', defaultValue: 30 },
  verifiedAt: { type: DataTypes.DATE, field: 'verified_at' },
  trainingCompletedAt: { type: DataTypes.DATE, field: 'training_completed_at' }
}, { 
  tableName: 'onboarding', 
  timestamps: true,
  paranoid: true
});
