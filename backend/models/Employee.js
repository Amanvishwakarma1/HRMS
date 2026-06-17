import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.STRING, defaultValue: 'Employee' },
  password: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'employees', timestamps: false });