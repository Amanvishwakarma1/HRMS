import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  action: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, field: 'user_id' },
  username: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  oldValue: { type: DataTypes.TEXT, field: 'old_value' },
  newValue: { type: DataTypes.TEXT, field: 'new_value' },
  ipAddress: { type: DataTypes.STRING, field: 'ip_address' },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'audit_logs', timestamps: false });
