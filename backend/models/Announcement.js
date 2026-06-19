import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  priority: { type: DataTypes.STRING, defaultValue: 'Low' }, // 'Low', 'Medium', 'High', 'Critical'
  targetAudience: { type: DataTypes.STRING, field: 'target_audience', defaultValue: 'All' }, // 'All', 'Department', 'Role', 'Individual'
  targetId: { type: DataTypes.STRING, field: 'target_id' }, // holds department name, role string, or employee id
  expiryDate: { type: DataTypes.DATE, field: 'expiry_date' },
  createdBy: { type: DataTypes.INTEGER, field: 'created_by' },
  updatedBy: { type: DataTypes.INTEGER, field: 'updated_by' }
}, { 
  tableName: 'announcements', 
  timestamps: true,
  paranoid: true
});
