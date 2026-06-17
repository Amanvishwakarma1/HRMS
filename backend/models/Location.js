import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Location = sequelize.define('Location', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  officeName: { type: DataTypes.STRING, field: 'office_name', allowNull: false },
  latitude: { type: DataTypes.DOUBLE, allowNull: false },
  longitude: { type: DataTypes.DOUBLE, allowNull: false },
  radiusMeters: { type: DataTypes.INTEGER, field: 'radius_meters', defaultValue: 200 }
}, { tableName: 'locations', timestamps: false });