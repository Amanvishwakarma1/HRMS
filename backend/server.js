import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readData, writeData } from './db.js';
import { sequelize } from './config/db.js';
import { 
  checkIn, 
  checkOut, 
  getHistory, 
  getAllAttendance,
  getLiveTracking,
  getAllEmployees
} from './controllers/attendanceController.js';
import { getGeofence, updateGeofence } from './controllers/geofenceController.js';
import { Attendance } from './models/Attendance.js';
import { Employee } from './models/Employee.js';
import { Location } from './models/Location.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Core Configuration Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json()); // Essential to parse json data payloads sent by the frontend
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Establish Explicit Database Schema Relationship Chains
Attendance.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id' });
Employee.hasMany(Attendance, { foreignKey: 'employeeId', sourceKey: 'id' });


// --- MOCK API ENDPOINTS (from index.js) ---

// --- Auth Endpoints ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (password !== 'password123') {
    return res.status(401).json({ success: false, message: 'Invalid password. Try "password123".' });
  }

  const normalized = username.trim().toLowerCase();
  let role = '';
  if (normalized === 'admin') role = 'admin';
  else if (normalized === 'hr') role = 'hr';
  else if (normalized === 'manager') role = 'manager';
  else if (normalized === 'employee') role = 'employee';
  else {
    return res.status(404).json({ success: false, message: 'User not found. Try admin, hr, manager, or employee.' });
  }

  res.json({ success: true, username: username.trim(), role });
});

// --- Employee Mock CRUD Endpoints ---
app.get('/api/employees', (req, res) => {
  const db = readData();
  res.json({ success: true, data: db.employees });
});

app.post('/api/employees', (req, res) => {
  const db = readData();
  const newEmp = {
    ...req.body,
    id: `EMP-00${db.employees.length + 1}`,
    status: 'Active'
  };
  db.employees.push(newEmp);
  writeData(db);
  res.status(201).json({ success: true, data: newEmp, message: 'Employee added successfully!' });
});

app.get('/api/employees/:id', (req, res) => {
  const db = readData();
  const emp = db.employees.find(e => e.id === req.params.id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
  res.json({ success: true, data: emp });
});

app.put('/api/employees/:id', (req, res) => {
  const db = readData();
  const idx = db.employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Employee not found' });

  db.employees[idx] = { ...db.employees[idx], ...req.body };
  writeData(db);
  res.json({ success: true, data: db.employees[idx], message: 'Employee updated successfully!' });
});

// --- Leave Endpoints ---
app.get('/api/leaves', (req, res) => {
  const db = readData();
  res.json({ success: true, data: db.leaves });
});

app.post('/api/leaves', (req, res) => {
  const db = readData();
  const newLeave = {
    id: `REQ-${100 + db.leaves.length + 1}`,
    appliedOn: new Date().toISOString().split('T')[0],
    status: 'Pending',
    ...req.body
  };
  db.leaves.push(newLeave);
  writeData(db);
  res.status(201).json({ success: true, data: newLeave, message: 'Leave request submitted successfully!' });
});

app.put('/api/leaves/:id', (req, res) => {
  const db = readData();
  const idx = db.leaves.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Leave request not found.' });

  db.leaves[idx].status = req.body.status;
  writeData(db);
  res.json({ success: true, message: `Leave request status updated to ${req.body.status}!` });
});

// --- Mock Attendance Endpoints (for Mock users) ---
app.get('/api/attendance/status/:username', (req, res) => {
  const db = readData();
  const username = req.params.username;
  let status = db.attendance_status[username];

  if (!status) {
    status = {
      isClockedIn: false,
      lastCheckInTime: null,
      accumulatedTime: 0,
      elapsedTime: 0,
      punches: [],
      date: new Date().toISOString().split('T')[0]
    };
    db.attendance_status[username] = status;
    writeData(db);
  } else {
    if (status.isClockedIn && status.lastCheckInTime) {
      const elapsed = Math.floor((Date.now() - status.lastCheckInTime) / 1000);
      status.elapsedTime = status.accumulatedTime + elapsed;
    }
  }

  res.json({ success: true, data: status });
});

app.post('/api/attendance/clock-in', (req, res) => {
  const db = readData();
  const { username, location, lat, lng } = req.body;
  let status = db.attendance_status[username];

  const officeLat = 12.97160;
  const officeLng = 77.59460;
  const fenceRadius = 200;

  if (location === 'Office') {
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'GPS coordinates are required to check in at the Office Geofence.' });
    }
    const distance = calculateDistance(lat, lng, officeLat, officeLng);
    if (distance > fenceRadius) {
      return res.status(400).json({
        success: false,
        message: `Clock-in Blocked: You are outside the office geofence. Distance: ${Math.round(distance)}m (Allowed limit: ${fenceRadius}m).`
      });
    }
  }

  if (!status || status.date !== new Date().toISOString().split('T')[0]) {
    status = {
      isClockedIn: false,
      lastCheckInTime: null,
      accumulatedTime: 0,
      elapsedTime: 0,
      punches: [],
      date: new Date().toISOString().split('T')[0]
    };
  }

  if (status.isClockedIn) {
    return res.status(400).json({ success: false, message: 'Already clocked in!' });
  }

  const now = Date.now();
  const checkInTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  status.isClockedIn = true;
  status.lastCheckInTime = now;
  status.punches.push({
    in: checkInTimeStr,
    out: '--',
    location: location || 'Office'
  });

  db.attendance_status[username] = status;
  writeData(db);
  res.json({ success: true, data: status, message: 'Clocked in successfully!' });
});

// Helper for Mock geofence
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

app.post('/api/attendance/clock-out', (req, res) => {
  const db = readData();
  const { username } = req.body;
  const status = db.attendance_status[username];

  if (!status || !status.isClockedIn) {
    return res.status(400).json({ success: false, message: 'Not clocked in!' });
  }

  const now = Date.now();
  const checkOutTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const elapsed = Math.floor((now - status.lastCheckInTime) / 1000);
  const newAccumulated = status.accumulatedTime + elapsed;

  const lastIndex = status.punches.length - 1;
  const durationHrs = (elapsed / 3600).toFixed(2);
  status.punches[lastIndex] = {
    ...status.punches[lastIndex],
    out: checkOutTimeStr,
    duration: `${durationHrs} hrs`
  };

  status.isClockedIn = false;
  status.lastCheckInTime = null;
  status.accumulatedTime = newAccumulated;
  status.elapsedTime = newAccumulated;

  db.attendance_status[username] = status;

  const todayStr = status.date;
  const activeHours = parseFloat((newAccumulated / 3600).toFixed(2));
  
  let dayStatus = 'Present';
  const firstPunchTime = status.punches[0]?.in;
  
  if (firstPunchTime) {
    const [time, modifier] = firstPunchTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let checkInHour = hours;
    if (modifier === 'PM' && checkInHour !== 12) checkInHour += 12;
    if (modifier === 'AM' && checkInHour === 12) checkInHour = 0;
    const totalMinutes = checkInHour * 60 + minutes;
    if (totalMinutes > (9 * 60 + 30)) {
      dayStatus = 'Late';
    }
  }

  if (activeHours > 0 && activeHours < 4) dayStatus = 'Half Day';
  if (activeHours === 0) dayStatus = 'Absent';

  const logData = {
    username,
    date: todayStr,
    status: dayStatus,
    checkIn: status.punches[0]?.in || '--',
    checkOut: checkOutTimeStr,
    activeHours,
    breakHours: 1.0,
    punches: status.punches
  };

  const existingIdx = db.attendance_logs.findIndex(log => log.date === todayStr && log.username === username);
  if (existingIdx !== -1) {
    db.attendance_logs[existingIdx] = logData;
  } else {
    db.attendance_logs.unshift(logData);
  }

  writeData(db);
  res.json({ success: true, data: status, message: 'Clocked out successfully!' });
});

app.get('/api/attendance/logs/:username', (req, res) => {
  const db = readData();
  const username = req.params.username;
  const userLogs = db.attendance_logs.filter(log => log.username === username);
  res.json({ success: true, data: userLogs });
});

app.get('/api/attendance/regularizations', (req, res) => {
  const db = readData();
  res.json({ success: true, data: db.regularizations });
});

app.post('/api/attendance/regularizations', (req, res) => {
  const db = readData();
  const newReq = {
    id: `REG-${500 + db.regularizations.length + 1}`,
    appliedOn: new Date().toISOString().split('T')[0],
    status: 'Pending',
    ...req.body
  };
  db.regularizations.unshift(newReq);
  writeData(db);
  res.json({ success: true, data: newReq, message: 'Regularization request submitted!' });
});

app.put('/api/attendance/regularizations/:id', (req, res) => {
  const db = readData();
  const { id } = req.params;
  const { status } = req.body;
  const idx = db.regularizations.findIndex(r => r.id === id);

  if (idx === -1) return res.status(404).json({ success: false, message: 'Request not found.' });

  db.regularizations[idx].status = status;

  if (status === 'Approved') {
    const approvedReq = db.regularizations[idx];
    const logIndex = db.attendance_logs.findIndex(l => l.date === approvedReq.date && l.username === 'employee');
    const activeHours = 8.5;
    
    const updatedLog = {
      username: 'employee',
      date: approvedReq.date,
      status: 'Present',
      checkIn: approvedReq.requestedCheckIn,
      checkOut: approvedReq.requestedCheckOut,
      activeHours,
      breakHours: 1.0,
      punches: [
        { in: approvedReq.requestedCheckIn, out: approvedReq.requestedCheckOut, duration: '8.5 hrs', location: 'Office (Regularized)' }
      ]
    };

    if (logIndex !== -1) {
      db.attendance_logs[logIndex] = updatedLog;
    } else {
      db.attendance_logs.unshift(updatedLog);
    }
  }

  writeData(db);
  res.json({ success: true, message: `Request status updated to ${status}!` });
});

// --- Expense Endpoints ---
app.get('/api/expenses', (req, res) => {
  const db = readData();
  res.json({ success: true, data: db.expenses });
});

app.post('/api/expenses', (req, res) => {
  const db = readData();
  const newExp = {
    id: `EXP-${100 + db.expenses.length + 1}`,
    status: 'Pending',
    ...req.body
  };
  db.expenses.unshift(newExp);
  writeData(db);
  res.status(201).json({ success: true, data: newExp, message: 'Expense claim submitted!' });
});

app.put('/api/expenses/:id', (req, res) => {
  const db = readData();
  const idx = db.expenses.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Expense not found.' });

  db.expenses[idx].status = req.body.status;
  writeData(db);
  res.json({ success: true, message: `Expense status updated to ${req.body.status}` });
});

// --- Payroll Endpoints ---
app.get('/api/payroll/structure/:employeeId', (req, res) => {
  res.json({
    success: true,
    data: {
      basic: 25000,
      hra: 10000,
      allowance: 5000,
      pf: 3000,
      tax: 2000,
      gross: 40000,
      net: 35000
    }
  });
});

app.get('/api/payroll/payslips/:employeeId', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'SLIP-01', month: 'May 2026', amount: 35000, status: 'Paid', date: '2026-05-31' },
      { id: 'SLIP-02', month: 'April 2026', amount: 35000, status: 'Paid', date: '2026-04-30' }
    ]
  });
});

app.post('/api/payroll/run', (req, res) => {
  res.json({ success: true, message: 'Payroll for June 2026 processed successfully' });
});

// --- Notification Endpoints ---
app.get('/api/notifications', (req, res) => {
  const db = readData();
  res.json({ success: true, data: db.notifications });
});

app.put('/api/notifications/mark-all-read', (req, res) => {
  const db = readData();
  db.notifications = db.notifications.map(n => ({ ...n, isRead: true }));
  writeData(db);
  res.json({ success: true, message: 'All notifications marked as read.' });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const db = readData();
  const idx = db.notifications.findIndex(n => n.id === req.params.id);
  if (idx !== -1) {
    db.notifications[idx].isRead = true;
    writeData(db);
    res.json({ success: true, message: 'Notification marked as read.' });
  } else {
    res.status(404).json({ success: false, message: 'Notification not found' });
  }
});


// --- POSTGRES-BACKED ATTENDANCE API ENDPOINTS (from server.js) ---
app.post('/api/attendance/checkin', checkIn);
app.post('/api/attendance/checkout', checkOut);
app.get('/api/attendance/history/:employeeId', getHistory);
app.get('/api/attendance/all', getAllAttendance);
app.get('/api/attendance/live-tracking', getLiveTracking);

// Dedicated Postgres Employee API for Attendance Drodown
app.get('/api/attendance/employees', getAllEmployees); 

app.get('/api/geofence', getGeofence);
app.post('/api/geofence/update', updateGeofence);

// Catch-all route
app.use((req, res) => {
  console.log(`⚠️ Unhandled endpoint request route string intercepted: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route path ${req.url} does not exist on this server.` });
});


// Sync Database and Start Server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Chronos API Unified Server listening on Port: ${PORT}`);
  });
};

sequelize.sync({ alter: false })
  .then(() => {
    console.log('✅ Sequelize ORM models successfully verified with Neon schema maps!');
    startServer();
  })
  .catch((error) => {
    console.error('❌ DATABASE HANDSHAKE FAULT (Mock Fallback Active):', error.message);
    startServer();
  });