import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

process.on('uncaughtException', (err) => {
  console.error('[GLOBAL SERVER UNCAUGHT EXCEPTION]', err.stack || err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[GLOBAL SERVER UNHANDLED REJECTION]', reason.stack || reason);
});
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readData, writeData } from './db.js';
import { sequelize } from './config/db.js';

const app = express();


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
import { LeaveRequest } from './models/LeaveRequest.js';
import { Notification } from './models/Notification.js';
import { Regularization } from './models/Regularization.js';
import { Op } from 'sequelize';

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

// New models
import { JobOpening } from './models/JobOpening.js';
import { Applicant } from './models/Applicant.js';
import { Onboarding } from './models/Onboarding.js';
import { Announcement } from './models/Announcement.js';

// New controllers
import { 
  getAllOpenings, createOpening, updateOpening, deleteOpening, 
  closeOpening, getApplicants, createApplicant, updateApplicantStatus 
} from './controllers/jobController.js';
import { 
  getOnboardingList, createOnboarding, updateOnboardingStatus 
} from './controllers/onboardingController.js';
import { 
  getAnnouncements, getAllAnnouncementsAdmin, createAnnouncement, updateAnnouncement, deleteAnnouncement 
} from './controllers/announcementController.js';
import { getDashboardAnalytics } from './controllers/dashboardController.js';

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
const PORT = process.env.PORT || 5000;

// 1. Core Configuration Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '20mb' })); // Support larger base64 file payloads
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


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

LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id', as: 'employee' });
Employee.hasMany(LeaveRequest, { foreignKey: 'employeeId', sourceKey: 'id' });

Notification.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id', as: 'employee' });
Employee.hasMany(Notification, { foreignKey: 'employeeId', sourceKey: 'id' });

Regularization.belongsTo(Employee, { foreignKey: 'employeeId', targetKey: 'id', as: 'employee' });
Employee.hasMany(Regularization, { foreignKey: 'employeeId', sourceKey: 'id' });

Regularization.belongsTo(Attendance, { foreignKey: 'attendanceId', targetKey: 'id', as: 'attendance' });
Attendance.hasMany(Regularization, { foreignKey: 'attendanceId', sourceKey: 'id' });

Applicant.belongsTo(JobOpening, { foreignKey: 'jobOpeningId', as: 'jobOpening' });
JobOpening.hasMany(Applicant, { foreignKey: 'jobOpeningId', as: 'applicants' });

Onboarding.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasOne(Onboarding, { foreignKey: 'employeeId', as: 'onboarding' });


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
app.get('/api/leaves/balance', authenticateToken, async (req, res) => {
  try {
    const approvedLeaves = await LeaveRequest.findAll({
      where: { employeeId: req.user.id, status: 'Approved' }
    });
    let takenDays = 0;
    approvedLeaves.forEach(l => {
      const diff = new Date(l.endDate) - new Date(l.startDate);
      takenDays += Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
    });
    const balance = Math.max(0, 12 - takenDays);
    res.json({ success: true, balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/leaves', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    let whereClause = {};
    if (role === 'employee') {
      whereClause.employeeId = req.user.id;
    }
    
    const leaves = await LeaveRequest.findAll({
      where: whereClause,
      include: [{ model: Employee, as: 'employee', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    
    const mapped = leaves.map(l => ({
      id: l.id,
      employeeName: l.employee ? l.employee.name : 'Unknown',
      appliedOn: l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: l.type,
      startDate: l.startDate,
      endDate: l.endDate,
      reason: l.reason,
      status: l.status
    }));
    
    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/leaves', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    let employeeId = req.user.id;
    
    if (role !== 'employee' && req.body.employeeName) {
      const targetEmp = await Employee.findOne({ where: { name: req.body.employeeName } });
      if (targetEmp) {
        employeeId = targetEmp.id;
      }
    }
    
    const { type, startDate, endDate, reason } = req.body;
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required leave fields.' });
    }
    
    const newLeave = await LeaveRequest.create({
      employeeId,
      type,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    });
    
    res.status(201).json({ 
      success: true, 
      data: {
        id: newLeave.id,
        employeeName: req.body.employeeName || req.user.username,
        appliedOn: new Date(newLeave.createdAt).toISOString().split('T')[0],
        type: newLeave.type,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        reason: newLeave.reason,
        status: newLeave.status
      }, 
      message: 'Leave request submitted successfully!' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/leaves/:id', authenticateToken, requireRole(['admin', 'hr', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, requestMessage } = req.body;
    
    const leave = await LeaveRequest.findByPk(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }
    
    const updates = { 
      status,
      approvedBy: req.user.id
    };
    if (rejectionReason !== undefined) {
      updates.rejectionReason = rejectionReason;
    }
    if (requestMessage !== undefined) {
      updates.requestMessage = requestMessage;
    }
    
    await leave.update(updates);
    
    res.json({ success: true, message: `Leave request status updated to ${status}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Job Opening Endpoints ---
app.get('/api/jobs', authenticateToken, getAllOpenings);
app.post('/api/jobs', authenticateToken, requireRole(['admin', 'hr']), createOpening);
app.put('/api/jobs/:id', authenticateToken, requireRole(['admin', 'hr']), updateOpening);
app.delete('/api/jobs/:id', authenticateToken, requireRole(['admin', 'hr']), deleteOpening);
app.put('/api/jobs/:id/close', authenticateToken, requireRole(['admin', 'hr']), closeOpening);
app.get('/api/jobs/:jobOpeningId/applicants', authenticateToken, requireRole(['admin', 'hr']), getApplicants);
app.post('/api/jobs/:jobOpeningId/applicants', createApplicant);
app.put('/api/applicants/:id/status', authenticateToken, requireRole(['admin', 'hr']), updateApplicantStatus);

// --- Onboarding Endpoints ---
app.get('/api/onboarding', authenticateToken, requireRole(['admin', 'hr']), getOnboardingList);
app.post('/api/onboarding', authenticateToken, requireRole(['admin', 'hr']), createOnboarding);
app.put('/api/onboarding/:id/status', authenticateToken, requireRole(['admin', 'hr']), updateOnboardingStatus);

// --- Announcement Endpoints ---
app.get('/api/announcements', authenticateToken, getAnnouncements);
app.get('/api/announcements/admin', authenticateToken, requireRole(['admin', 'hr']), getAllAnnouncementsAdmin);
app.post('/api/announcements', authenticateToken, requireRole(['admin', 'hr']), createAnnouncement);
app.put('/api/announcements/:id', authenticateToken, requireRole(['admin', 'hr']), updateAnnouncement);
app.delete('/api/announcements/:id', authenticateToken, requireRole(['admin', 'hr']), deleteAnnouncement);

// --- Dashboard Analytics Endpoint ---
app.get('/api/dashboard/analytics', authenticateToken, getDashboardAnalytics);

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

// --- Regularization Endpoints ---
app.get('/api/attendance/regularizations', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    let whereClause = {};
    if (role === 'employee') {
      whereClause.employeeId = req.user.id;
    }

    const list = await Regularization.findAll({
      where: whereClause,
      include: [{ model: Employee, as: 'employee', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    const mapped = list.map(r => ({
      id: r.id,
      date: r.date,
      reason: r.reason,
      requestedCheckIn: r.requestedCheckIn,
      requestedCheckOut: r.requestedCheckOut,
      status: r.status,
      appliedOn: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      employeeName: r.employee ? r.employee.name : 'Unknown'
    }));

    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/attendance/regularizations', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    let employeeId = req.user.id;

    if (role !== 'employee' && req.body.employeeName) {
      const targetEmp = await Employee.findOne({ where: { name: req.body.employeeName } });
      if (targetEmp) {
        employeeId = targetEmp.id;
      }
    }

    const { date, reason, requestedCheckIn, requestedCheckOut } = req.body;
    if (!date || !reason || !requestedCheckIn || !requestedCheckOut) {
      return res.status(400).json({ success: false, message: 'Missing required regularization fields.' });
    }

    const newReq = await Regularization.create({
      employeeId,
      date,
      reason,
      requestedCheckIn,
      requestedCheckOut,
      status: 'Pending'
    });

    res.json({
      success: true,
      data: {
        id: newReq.id,
        date: newReq.date,
        reason: newReq.reason,
        requestedCheckIn: newReq.requestedCheckIn,
        requestedCheckOut: newReq.requestedCheckOut,
        status: newReq.status,
        appliedOn: new Date(newReq.createdAt).toISOString().split('T')[0],
        employeeName: req.body.employeeName || req.user.username
      },
      message: 'Regularization request submitted!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/attendance/regularizations/:id', authenticateToken, requireRole(['admin', 'hr', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reg = await Regularization.findByPk(id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    await reg.update({ status });

    if (status === 'Approved') {
      const parseTime = (dateStr, time12hStr) => {
        if (!time12hStr || time12hStr === '--') return null;
        const [time, modifier] = time12hStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        const d = new Date(dateStr);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      const startDate = new Date(reg.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(reg.date);
      endDate.setHours(23, 59, 59, 999);

      const existingAttendance = await Attendance.findOne({
        where: {
          employeeId: reg.employeeId,
          checkInTime: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      if (existingAttendance) {
        await existingAttendance.update({
          checkInTime: parseTime(reg.date, reg.requestedCheckIn),
          checkOutTime: parseTime(reg.date, reg.requestedCheckOut),
          totalHours: 8.5,
          status: 'Present'
        });
      } else {
        await Attendance.create({
          employeeId: reg.employeeId,
          checkInTime: parseTime(reg.date, reg.requestedCheckIn),
          checkOutTime: parseTime(reg.date, reg.requestedCheckOut),
          totalHours: 8.5,
          status: 'Present',
          latitude: 28.6282,
          longitude: 77.3898,
          geofenceVerified: true
        });
      }
    }

    res.json({ success: true, message: `Request status updated to ${status}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Expense Endpoints ---
app.use('/api/expenses', expenseRouter);

// --- Payroll Endpoints ---
app.get('/api/payroll/structure/:employeeId', authenticateToken, enforceEmployeeIsolation, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const structure = await SalaryStructure.findOne({ where: { employeeId: Number(employeeId) } });
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found for this employee.' });
    }
    
    const basic = structure.basicPay;
    const hra = structure.hra;
    const allowances = structure.conveyance + structure.medical + structure.specialAllowance + structure.otherAllowance;
    const gross = basic + hra + allowances;
    const pf = structure.pf;
    const esi = structure.esi;
    const pt = structure.professionalTax;
    const deductions = pf + esi + pt;
    const net = gross - deductions;

    res.json({
      success: true,
      data: {
        basic,
        hra,
        allowance: allowances,
        pf,
        tax: pt,
        gross,
        net
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/payroll/payslips/:employeeId', authenticateToken, enforceEmployeeIsolation, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await PayrollRecord.findAll({
      where: { employeeId: Number(employeeId) },
      order: [['month', 'DESC']]
    });
    
    const mapped = records.map(r => ({
      id: String(r.id),
      month: new Date(`${r.month}-02`).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      amount: r.netSalary,
      status: r.status,
      date: r.updatedAt ? new Date(r.updatedAt).toISOString().split('T')[0] : r.month
    }));
    
    res.json({
      success: true,
      data: mapped
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Notification Endpoints ---
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await Notification.findAll({
      where: {
        [Op.or]: [
          { employeeId: userId },
          { employeeId: null }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    
    const mapped = list.map(n => ({
      id: String(n.id),
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now'
    }));
    
    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.update(
      { isRead: true },
      {
        where: {
          [Op.or]: [
            { employeeId: userId },
            { employeeId: null }
          ]
        }
      }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      where: {
        id,
        [Op.or]: [
          { employeeId: userId },
          { employeeId: null }
        ]
      }
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    await notification.update({ isRead: true });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Dynamic Dashboard Stats Endpoints ---
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const totalEmployees = await Employee.count({ where: { status: 'Active' } });
    const pendingLeaves = await LeaveRequest.count({ where: { status: 'Pending' } });
    
    const pendingExpensesSumResult = await Expense.sum('amount', {
      where: { status: 'Submitted' }
    });
    const pendingExpensesSum = pendingExpensesSumResult || 0;

    const depts = await Employee.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('department')), 'department']]
    });
    const departmentsCount = depts.filter(d => d.department).length || 1;

    const auditLogs = await AuditLog.findAll({
      order: [['id', 'DESC']],
      limit: 5
    });

    const recentActivity = auditLogs.map(log => {
      const timeStr = log.createdAt 
        ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recently';
      return {
        id: log.id,
        time: timeStr,
        text: `${log.username} performed action: ${log.action}`
      };
    });

    res.json({
      success: true,
      data: {
        totalEmployees,
        pendingLeaves,
        pendingExpensesSum,
        departmentsCount,
        recentActivity
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/dashboard/manager-stats', authenticateToken, requireRole(['manager', 'admin', 'hr']), async (req, res) => {
  try {
    const managerId = req.user.id;
    const teamSize = await Employee.count({ where: { managerId } });
    
    const teamEmployees = await Employee.findAll({ where: { managerId }, attributes: ['id'] });
    const teamIds = teamEmployees.map(e => e.id);
    
    const today = new Date().toISOString().split('T')[0];
    const teamLeavesToday = await LeaveRequest.count({
      where: {
        employeeId: { [Op.in]: teamIds },
        status: 'Approved',
        startDate: { [Op.lte]: today },
        endDate: { [Op.gte]: today }
      }
    });

    const pendingLeaves = await LeaveRequest.count({
      where: {
        employeeId: { [Op.in]: teamIds },
        status: 'Pending'
      }
    });

    const pendingExpenses = await Expense.count({
      where: {
        employeeId: { [Op.in]: teamIds },
        status: 'Submitted'
      }
    });

    const pendingLeaveList = await LeaveRequest.findAll({
      where: { employeeId: { [Op.in]: teamIds }, status: 'Pending' },
      include: [{ model: Employee, as: 'employee', attributes: ['name'] }],
      limit: 5
    });

    const pendingExpenseList = await Expense.findAll({
      where: { employeeId: { [Op.in]: teamIds }, status: 'Submitted' },
      include: [{ model: Employee, as: 'employee', attributes: ['name'] }],
      limit: 5
    });

    const teamRequests = [];
    pendingLeaveList.forEach(l => {
      const daysCount = Math.round((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      teamRequests.push({
        id: `leave-${l.id}`,
        name: l.employee ? l.employee.name : 'Unknown',
        type: `${l.type} (${daysCount} Days)`,
        actionPath: '/leave/approval'
      });
    });

    pendingExpenseList.forEach(e => {
      teamRequests.push({
        id: `expense-${e.id}`,
        name: e.employee ? e.employee.name : 'Unknown',
        type: `${e.title} (₹${e.amount})`,
        actionPath: '/expenses/approvals'
      });
    });

    res.json({
      success: true,
      data: {
        teamSize,
        teamLeavesToday,
        pendingApprovalsCount: pendingLeaves + pendingExpenses,
        teamRequests
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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


// Serve static Vite bundle in production mode
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend/dist');
  app.use(express.static(distPath));
  
  // For any route that is not API, serve index.html
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error interceptor middleware
app.use((err, req, res, next) => {
  console.error('💥 ERROR IN INTERCEPTOR:', err.message);
  
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${err.stack}\n\n`;
  fs.appendFileSync(path.join(logsDir, 'error.log'), logMessage, 'utf8');

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Database Validation Error',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
  });
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