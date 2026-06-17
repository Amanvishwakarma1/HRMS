// backend/db.js
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const defaultData = {
  employees: [
    { id: 'EMP-001', name: 'Alice Smith', email: 'alice@company.com', department: 'Engineering', designation: 'Frontend Developer', status: 'Active', joinDate: '2023-01-15' },
    { id: 'EMP-002', name: 'Bob Johnson', email: 'bob@company.com', department: 'HR', designation: 'HR Manager', status: 'Active', joinDate: '2022-11-01' },
    { id: 'EMP-003', name: 'Charlie Davis', email: 'charlie@company.com', department: 'Sales', designation: 'Account Executive', status: 'On Leave', joinDate: '2024-02-10' },
    { id: 'EMP-004', name: 'Aman Vishwakarma', email: 'aman@company.com', department: 'Engineering', designation: 'Fullstack Developer', status: 'Active', joinDate: '2025-06-01' }
  ],
  leaves: [
    { id: 'REQ-101', employeeName: 'Alice Smith', type: 'Sick Leave', startDate: '2026-06-20', endDate: '2026-06-22', reason: 'Medical appointment and recovery', status: 'Pending', appliedOn: '2026-06-15' },
    { id: 'REQ-102', employeeName: 'Bob Johnson', type: 'Casual Leave', startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Family vacation', status: 'Approved', appliedOn: '2026-06-10' }
  ],
  attendance_status: {}, // Keyed by username
  attendance_logs: [],    // List of log entry records
  regularizations: [
    {
      id: 'REG-501',
      date: '2026-06-10',
      reason: 'Forgot to check out due to urgent client call',
      requestedCheckIn: '09:00 AM',
      requestedCheckOut: '06:30 PM',
      status: 'Approved',
      appliedOn: '2026-06-11',
      employeeName: 'Aman Vishwakarma'
    },
    {
      id: 'REG-502',
      date: '2026-06-15',
      reason: 'System was down during check-in',
      requestedCheckIn: '08:55 AM',
      requestedCheckOut: '06:00 PM',
      status: 'Pending',
      appliedOn: '2026-06-16',
      employeeName: 'Aman Vishwakarma'
    }
  ],
  expenses: [
    { id: "EXP-101", date: "2026-06-10", description: "Client Dinner", category: "Meals", amount: 120.50, status: "Approved" },
    { id: "EXP-102", date: "2026-06-12", description: "Flight to Tech Conference", category: "Travel", amount: 450.00, status: "Pending" },
    { id: "EXP-103", date: "2026-06-14", description: "New Office Monitor", category: "Equipment", amount: 299.99, status: "Rejected" }
  ],
  notifications: [
    { id: '1', type: 'info', title: 'Welcome to HRMS Portal', message: 'Hello! Welcome to your new HRMS Dashboard. Explore your Profile, Attendance timings, Leave, and Finances.', time: '2 hours ago', isRead: false },
    { id: '2', type: 'success', title: 'Leave Request Approved', message: 'Your casual leave request for 2026-07-01 to 2026-07-05 has been approved by Bob Johnson.', time: '1 day ago', isRead: false },
    { id: '3', type: 'info', title: 'Payroll Payslip Generated', message: 'Your salary payslip for May 2026 is now available. Go to My Finance -> Payslips to download.', time: '3 days ago', isRead: true }
  ]
};

// Populate initial dummy logs for Aman Vishwakarma (username: employee or aman)
const generateInitialLogs = () => {
  const logs = [];
  const today = new Date();
  for (let i = 20; i >= 1; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayName === 'Saturday' || dayName === 'Sunday') continue;

    const dateStr = date.toISOString().split('T')[0];
    const rand = Math.random();
    let status = 'Present';
    let checkIn = '09:00 AM';
    let checkOut = '06:30 PM';
    let activeHours = 8.5;

    if (rand < 0.1) {
      status = 'Late';
      checkIn = '09:45 AM';
      activeHours = 7.75;
    } else if (rand < 0.15) {
      status = 'Half Day';
      checkIn = '09:00 AM';
      checkOut = '01:30 PM';
      activeHours = 4.5;
    }

    logs.push({
      username: 'employee',
      date: dateStr,
      status,
      checkIn,
      checkOut,
      activeHours,
      breakHours: 1.0,
      punches: [
        { in: checkIn, out: status === 'Half Day' ? '01:30 PM' : '01:00 PM', location: 'Office' },
        { in: status === 'Half Day' ? '--' : '02:00 PM', out: status === 'Half Day' ? '--' : '06:30 PM', location: 'Office' }
      ]
    });
  }
  return logs;
};

defaultData.attendance_logs = generateInitialLogs();

const readData = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file:', err);
    return defaultData;
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
};

module.exports = {
  readData,
  writeData
};
