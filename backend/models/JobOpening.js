import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const JobOpening = sequelize.define('JobOpening', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Active' }, // 'Active', 'Closed'
  vacancyCount: { type: DataTypes.INTEGER, field: 'vacancy_count', defaultValue: 1 },
  description: { type: DataTypes.TEXT },
  createdBy: { type: DataTypes.INTEGER, field: 'created_by' },
  updatedBy: { type: DataTypes.INTEGER, field: 'updated_by' }
}, { 
  tableName: 'job_openings', 
  timestamps: true,
  paranoid: true
});
