import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { JobOpening } from './JobOpening.js';

export const Applicant = sequelize.define('Applicant', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobOpeningId: { type: DataTypes.INTEGER, field: 'job_opening_id', references: { model: JobOpening, key: 'id' } },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'Applied' }, // 'Applied', 'Interviewing', 'Offered', 'Rejected'
  resumeUrl: { type: DataTypes.TEXT, field: 'resume_url' }
}, { 
  tableName: 'applicants', 
  timestamps: true,
  paranoid: true
});
