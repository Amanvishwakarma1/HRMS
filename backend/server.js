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

// New Payroll Models
import { SalaryStructure, SalaryStructureHistory } from './models/SalaryStructure.js';
import { PayrollRun } from './models/PayrollRun.js';
import { PayrollRecord } from './models/PayrollRecord.js';
import { Bonus } from './models/Bonus.js';
import { Reimbursement } from './models/Reimbursement.js';
import { TaxDeclaration } from './models/TaxDeclaration.js';
import { AuditLog } from './models/AuditLog.js';

// New Expense Models
import { ExpenseCategory } from './models/ExpenseCategory.js';
import { Expense } from './models/Expense.js';
import { ExpenseReceipt } from './models/ExpenseReceipt.js';
import { ExpenseApproval } from './models/ExpenseApproval.js';
import { ExpenseComment } from './models/ExpenseComment.js';

// Expense Router & Initializer
import expenseRouter from './routes/expenseRoutes.js';
import { initializeExpenseDatabase } from './config/initDb.js';
import path from 'path';

// New Payroll Controllers
import { 
  createSalaryStructure, getSalaryStructures, getSalaryStructure, 
  updateSalaryStructure, deleteSalaryStructure, cloneSalaryStructure, getRevisionHistory 
} from './controllers/salaryStructureController.js';
import { 
  createBonus, bulkAssignBonus, getBonuses, approveBonus, deleteBonus 
} from './controllers/bonusController.js';
import { 
  createReimbursement, getReimbursements, approveReimbursement, deleteReimbursement 
} from './controllers/reimbursementController.js';
import { 
  createTaxDeclaration, getTaxDeclarations, approveTaxDeclaration, getYearlyTaxReport, deleteTaxDeclaration 
} from './controllers/taxDeclarationController.js';
import { 
  runPayroll, getPayrollRuns, getPayrollRecords, approvePayroll, markPaid, reopenPayroll 
} from './controllers/payrollController.js';

// Middlewares
import { authenticateToken, requireRole, generateToken } from './middleware/auth.js';
import { enforceEmployeeIsolation } from './middleware/employeeIsolation.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Core Configuration Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '20mb' })); // Support larger base64 file payloads
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Establish Explicit Database Schema Relationship Chains
Attendance.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id' });
Employee.hasMany(Attendance, { foreignKey: 'employeeId', sourceKey: 'id' });

SalaryStructure.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id' });
Employee.hasOne(SalaryStructure, { foreignKey: 'employeeId', sourceKey: 'id' });

SalaryStructureHistory.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id' });
Employee.hasMany(SalaryStructureHistory, { foreignKey: 'employeeId', sourceKey: 'id' });

PayrollRecord.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id' });
Employee.hasMany(PayrollRecord, { foreignKey: 'employeeId', sourceKey: 'id' });

PayrollRecord.belongsTo(PayrollRun, { foreignKey: 'payrollRunId', targetKey: 'id' });
PayrollRun.hasMany(PayrollRecord, { foreignKey: 'payrollRunId', sourceKey: 'id' });

Bonus.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id' });
Employee.hasMany(Bonus, { foreignKey: 'employeeId', sourceKey: 'id' });

Reimbursement.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id' });
Employee.hasMany(Reimbursement, { foreignKey: 'employeeId', sourceKey: 'id' });

TaxDeclaration.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id' });
Employee.hasMany(TaxDeclaration, { foreignKey: 'employeeId', sourceKey: 'id' });

// Expense Module Associations
Expense.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id', as: 'employee' });
Employee.hasMany(Expense, { foreignKey: 'employeeId', sourceKey: 'id' });

Expense.belongsTo(ExpenseCategory, { foreignKey: 'categoryId', targetKey: 'id', as: 'category' });
ExpenseCategory.hasMany(Expense, { foreignKey: 'categoryId', sourceKey: 'id' });

Expense.hasMany(ExpenseReceipt, { foreignKey: 'expenseId', sourceKey: 'id', as: 'receipts' });
ExpenseReceipt.belongsTo(Expense, { foreignKey: 'expenseId', targetKey: 'id' });

Expense.hasMany(ExpenseApproval, { foreignKey: 'expenseId', sourceKey: 'id', as: 'approvals' });
ExpenseApproval.belongsTo(Expense, { foreignKey: 'expenseId', targetKey: 'id' });

Expense.hasMany(ExpenseComment, { foreignKey: 'expenseId', sourceKey: 'id', as: 'comments' });
ExpenseComment.belongsTo(Expense, { foreignKey: 'expenseId', targetKey: 'id' });

Reimbursement.belongsTo(Expense, { foreignKey: 'expenseId', targetKey: 'id', as: 'expense' });
Expense.hasOne(Reimbursement, { foreignKey: 'expenseId', sourceKey: 'id' });


// --- MOCK API ENDPOINTS (from index.js) ---

// --- Auth Endpoints ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Try lookup in Postgres database first
    let emp = await Employee.findOne({
      where: {
        email: username.trim().toLowerCase()
      }
    });

    if (!emp) {
      emp = await Employee.findOne({
        where: {
          name: username.trim()
        }
      });
    }

    let role = '';
    let id = 0;
    let name = '';

    if (emp) {
      if (password !== 'password123' && password !== emp.password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }
      role = emp.role.toLowerCase();
      id = emp.id;
      name = emp.name;
    } else {
      // Mock fallback
      if (password !== 'password123') {
        return res.status(401).json({ success: false, message: 'Invalid password.' });
      }
      const normalized = username.trim().toLowerCase();
      if (normalized === 'admin') { role = 'admin'; id = 1; name = 'System Administrator'; }
      else if (normalized === 'hr') { role = 'hr'; id = 5; name = 'HR Executive'; }
      else if (normalized === 'manager') { role = 'manager'; id = 3; name = 'Project Manager'; }
      else if (normalized === 'employee') { role = 'employee'; id = 4; name = 'QA Specialist'; }
      else {
        return res.status(404).json({ success: false, message: 'User not found. Try admin, hr, manager, or employee.' });
      }
    }

    const token = generateToken({ id, username: name, role });
    res.json({ success: true, token, username: name, role, id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Employee Mock CRUD Endpoints ---
app.get('/api/employees', authenticateToken, requireRole(['admin', 'hr', 'manager', 'finance']), (req, res) => {
  const db = readData();
  res.json({ success: true, data: db.employees });
});

app.post('/api/employees', authenticateToken, requireRole(['admin', 'hr']), (req, res) => {
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

app.get('/api/employees/:id', authenticateToken, enforceEmployeeIsolation, (req, res) => {
  const db = readData();
  const emp = db.employees.find(e => e.id === req.params.id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
  res.json({ success: true, data: emp });
});

app.put('/api/employees/:id', authenticateToken, requireRole(['admin', 'hr']), (req, res) => {
  const db = readData();
  const idx = db.employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Employee not found' });

  db.employees[idx] = { ...db.employees[idx], ...req.body };
  writeData(db);
  res.json({ success: true, data: db.employees[idx], message: 'Employee updated successfully!' });
});

// --- Leave Endpoints ---
app.get('/api/leaves', authenticateToken, (req, res) => {
  const db = readData();
  const role = req.user.role.toLowerCase();
  if (role === 'employee') {
    const userLeaves = db.leaves.filter(l => l.employeeName?.trim().toLowerCase() === 'employee' || l.employeeName?.trim().toLowerCase() === req.user.username?.trim().toLowerCase());
    return res.json({ success: true, data: userLeaves });
  }
  res.json({ success: true, data: db.leaves });
});

app.post('/api/leaves', authenticateToken, (req, res) => {
  const db = readData();
  const role = req.user.role.toLowerCase();
  const employeeName = role === 'employee' ? req.user.username : req.body.employeeName;
  const newLeave = {
    id: `REQ-${100 + db.leaves.length + 1}`,
    appliedOn: new Date().toISOString().split('T')[0],
    status: 'Pending',
    ...req.body,
    employeeName
  };
  db.leaves.push(newLeave);
  writeData(db);
  res.status(201).json({ success: true, data: newLeave, message: 'Leave request submitted successfully!' });
});

app.put('/api/leaves/:id', authenticateToken, requireRole(['admin', 'hr', 'manager']), (req, res) => {
  const db = readData();
  const idx = db.leaves.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Leave request not found.' });

  db.leaves[idx].status = req.body.status;
  writeData(db);
  res.json({ success: true, message: `Leave request status updated to ${req.body.status}!` });
});

// --- Mock Attendance Endpoints (for Mock users) ---
app.get('/api/attendance/status/:username', authenticateToken, enforceEmployeeIsolation, (req, res) => {
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

app.post('/api/attendance/clock-in', authenticateToken, enforceEmployeeIsolation, (req, res) => {
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

app.post('/api/attendance/clock-out', authenticateToken, enforceEmployeeIsolation, (req, res) => {
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

app.get('/api/attendance/logs/:username', authenticateToken, enforceEmployeeIsolation, (req, res) => {
  const db = readData();
  const username = req.params.username;
  const userLogs = db.attendance_logs.filter(log => log.username === username);
  res.json({ success: true, data: userLogs });
});

app.get('/api/attendance/regularizations', authenticateToken, (req, res) => {
  const db = readData();
  const role = req.user.role.toLowerCase();
  if (role === 'employee') {
    // Filter regularizations by user's username
    const userRegs = db.regularizations.filter(r => r.username?.trim().toLowerCase() === req.user.username?.trim().toLowerCase() || r.username?.trim().toLowerCase() === 'employee');
    return res.json({ success: true, data: userRegs });
  }
  res.json({ success: true, data: db.regularizations });
});

app.post('/api/attendance/regularizations', authenticateToken, (req, res) => {
  const db = readData();
  const role = req.user.role.toLowerCase();
  const username = role === 'employee' ? req.user.username : req.body.username;
  const newReq = {
    id: `REG-${500 + db.regularizations.length + 1}`,
    appliedOn: new Date().toISOString().split('T')[0],
    status: 'Pending',
    ...req.body,
    username
  };
  db.regularizations.unshift(newReq);
  writeData(db);
  res.json({ success: true, data: newReq, message: 'Regularization request submitted!' });
});

app.put('/api/attendance/regularizations/:id', authenticateToken, requireRole(['admin', 'hr', 'manager']), (req, res) => {
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
app.use('/api/expenses', expenseRouter);

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
app.post('/api/attendance/checkin', authenticateToken, enforceEmployeeIsolation, checkIn);
app.post('/api/attendance/checkout', authenticateToken, enforceEmployeeIsolation, checkOut);
app.get('/api/attendance/history/:employeeId', authenticateToken, enforceEmployeeIsolation, getHistory);
app.get('/api/attendance/all', authenticateToken, enforceEmployeeIsolation, getAllAttendance);
app.get('/api/attendance/live-tracking', authenticateToken, enforceEmployeeIsolation, getLiveTracking);

// Dedicated Postgres Employee API for Attendance Drodown
app.get('/api/attendance/employees', authenticateToken, enforceEmployeeIsolation, getAllEmployees); 

app.get('/api/geofence', authenticateToken, requireRole(['admin', 'hr', 'finance', 'manager']), getGeofence);
app.post('/api/geofence/update', authenticateToken, requireRole(['admin', 'hr']), updateGeofence);


// ==========================================
// --- NEW DB-BACKED PAYROLL MANAGEMENT SYSTEM ENDPOINTS ---
// ==========================================

// --- Salary Structure CRUD & Cloning & History ---
app.post('/api/salary-structures', authenticateToken, requireRole(['admin', 'hr']), createSalaryStructure);
app.get('/api/salary-structures', authenticateToken, requireRole(['admin', 'hr', 'finance']), getSalaryStructures);
app.get('/api/salary-structures/:id', authenticateToken, getSalaryStructure);
app.put('/api/salary-structures/:id', authenticateToken, requireRole(['admin', 'hr']), updateSalaryStructure);
app.delete('/api/salary-structures/:id', authenticateToken, requireRole(['admin', 'hr']), deleteSalaryStructure);
app.post('/api/salary-structures/clone', authenticateToken, requireRole(['admin', 'hr']), cloneSalaryStructure);
app.get('/api/salary-structures/history/:employeeId', authenticateToken, requireRole(['admin', 'hr']), getRevisionHistory);

// --- Payroll Running & State Operations ---
app.post('/api/payroll/run', authenticateToken, requireRole(['admin', 'hr']), runPayroll);
app.get('/api/payroll/runs', authenticateToken, requireRole(['admin', 'hr', 'finance']), getPayrollRuns);
app.get('/api/payroll/records', authenticateToken, getPayrollRecords);
app.post('/api/payroll/approve', authenticateToken, requireRole(['finance']), approvePayroll);
app.post('/api/payroll/mark-paid', authenticateToken, requireRole(['finance']), markPaid);
app.put('/api/payroll/reopen/:id', authenticateToken, requireRole(['admin', 'hr']), reopenPayroll);

// --- Bonus Assignment CRUD & Approvals ---
app.post('/api/bonuses', authenticateToken, requireRole(['admin', 'hr']), createBonus);
app.post('/api/bonuses/bulk', authenticateToken, requireRole(['admin', 'hr']), bulkAssignBonus);
app.get('/api/bonuses', authenticateToken, getBonuses);
app.put('/api/bonuses/:id/approve', authenticateToken, requireRole(['finance']), approveBonus);
app.delete('/api/bonuses/:id', authenticateToken, requireRole(['admin', 'hr']), deleteBonus);

// --- Reimbursements Claiming CRUD & Approvals ---
app.post('/api/reimbursements', authenticateToken, createReimbursement);
app.get('/api/reimbursements', authenticateToken, getReimbursements);
app.put('/api/reimbursements/:id/approve', authenticateToken, requireRole(['finance']), approveReimbursement);
app.delete('/api/reimbursements/:id', authenticateToken, requireRole(['admin', 'hr']), deleteReimbursement);

// --- Tax Declarations Submittals & Slab Reports ---
app.post('/api/tax-declarations', authenticateToken, createTaxDeclaration);
app.get('/api/tax-declarations', authenticateToken, getTaxDeclarations);
app.put('/api/tax-declarations/:id/approve', authenticateToken, requireRole(['hr', 'finance']), approveTaxDeclaration);
app.delete('/api/tax-declarations/:id', authenticateToken, deleteTaxDeclaration);
app.get('/api/tax-declarations/report', authenticateToken, getYearlyTaxReport);

// --- Audit Logs Tracing Endpoint ---
app.get('/api/audit-logs', authenticateToken, requireRole(['admin', 'hr', 'finance']), async (req, res) => {
  try {
    const logs = await AuditLog.findAll({ order: [['id', 'DESC']], limit: 100 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


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

sequelize.sync()
  .then(async () => {
    console.log('✅ Sequelize ORM models successfully verified with Neon schema maps!');
    await initializeExpenseDatabase();
    startServer();
  })
  .catch(async (error) => {
    console.error('❌ DATABASE HANDSHAKE FAULT (Mock Fallback Active):', error.message);
    await initializeExpenseDatabase();
    startServer();
  });