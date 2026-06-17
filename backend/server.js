import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/db.js';
import { 
  checkIn, 
  checkOut, 
  getHistory, 
  getAllAttendance,
  getLiveTracking,
  getAllEmployees // ✅ Import employee listing function
} from './controllers/attendanceController.js';
import { getGeofence, updateGeofence } from './controllers/geofenceController.js';
import { Attendance } from './models/Attendance.js';
import { Employee } from './models/Employee.js';
import { Location } from './models/Location.js'; // Explicit model mapping registration

dotenv.config();
const app = express();

// 1. Core Configuration Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json()); // Essential to parse json data payloads sent by the frontend
app.use(express.urlencoded({ extended: true }));

// 2. Establish Explicit Database Schema Relationship Chains
// This ensures Sequelize maps 'employeeId' to your database relationships safely
Attendance.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id' });
Employee.hasMany(Attendance, { foreignKey: 'employeeId', sourceKey: 'id' });

// 3. Direct Route Endpoint Mount Gates (Matches your frontend fetch requests exactly)
app.post('/api/attendance/checkin', checkIn);
app.post('/api/attendance/checkout', checkOut);
app.get('/api/attendance/history/:employeeId', getHistory);
app.get('/api/attendance/all', getAllAttendance);
app.get('/api/employees', getAllEmployees); // ✅ Fetch employees list from Postgres database


// 📡 LIVE STREAM TELEMETRY ROUTE: Pulls both employees coordinates simultaneously for the frontend map
app.get('/api/attendance/live-tracking', getLiveTracking);

app.get('/api/geofence', getGeofence);
app.post('/api/geofence/update', updateGeofence);

// Catch-all route to quickly catch any misaligned frontend fetch attempts
app.use((req, res) => {
  console.log(`⚠️ Unhandled endpoint request route string intercepted: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route path ${req.url} does not exist on this server.` });
});

const PORT = process.env.PORT || 5000;

// 4. Safe Database Synchronization & App Activation Gateway
// We use { alter: false } or { force: false } so your live configurations inside Neon 
// are preserved dynamically without dropping table inputs on restart!
sequelize.sync({ alter: false })
  .then(() => {
    console.log('✅ Sequelize ORM models successfully verified with Neon schema maps!');
    app.listen(PORT, () => {
      console.log(`🚀 Chronos API Core listening on Port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ CRITICAL DB HANDSHAKE FAULT:', error.message);
  });