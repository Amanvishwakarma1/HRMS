import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Direct handshake configuration for your Neon cloud instance
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Neon serverless certificate validation
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});