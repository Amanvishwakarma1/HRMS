import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./modules/auth/pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";

// Core Dashboard Router
import DashboardRouter from "./modules/dashboard/DashboardRouter";
import JobOpenings from "./modules/dashboard/pages/JobOpenings";
import Onboarding from "./modules/dashboard/pages/Onboarding";
import HeadcountAnalytics from "./modules/dashboard/pages/HeadcountAnalytics";

// Employee Module
import Employee from "./modules/employee/pages/Employee";
import EmployeeList from "./modules/employee/pages/EmployeeList";
import AddEmployee from "./modules/employee/pages/AddEmployee";
import Departments from "./modules/employee/pages/Departments";
import Designations from "./modules/employee/pages/Designations";
import OrganizationChart from "./modules/employee/pages/OrganizationChart";
import EditEmployee from "./modules/employee/pages/EditEmployee";
import EmployeeProfile from "./modules/employee/pages/EmployeeProfile";

// Leave Module
import LeaveLayout from "./modules/leave/Pages/LeaveLayout";
import LeaveBalance from "./modules/leave/Pages/LeaveBalance";
import ApplyLeave from "./modules/leave/Pages/applyLeave";
import LeaveCalendar from "./modules/leave/Pages/LeaveCalendar";
import LeavePolicy from "./modules/leave/Pages/LeavePolicy";
import LeaveHistory from "./modules/leave/Pages/LeaveHistory";
import LeaveApproval from "./modules/leave/Pages/LeaveApproval";

// Expense Module
import ExpenseLayout from "./modules/expense/ExpenseLayout";
import ExpenseHistory from "./modules/expense/pages/ExpenseHistory";
import SubmitExpense from "./modules/expense/pages/SubmitExpense";
import ReimbursementStatus from "./modules/expense/pages/ReimbursementStatus";
import ExpenseApproval from "./modules/expense/pages/ExpenseApproval";
import ExpenseReports from "./modules/expense/pages/ExpenseReports";
import ExpensePolicy from "./modules/expense/pages/ExpensePolicy";

// Payroll Module
import PayrollLayout from "./modules/payroll/PayrollLayout";
import PayrollProcessing from "./modules/payroll/pages/PayrollProcessing";
import Payslips from "./modules/payroll/pages/Payslips";
import SalaryStructure from "./modules/payroll/pages/SalaryStructure";
import TaxDetails from "./modules/payroll/pages/TaxDetails";
import Bonus from "./modules/payroll/pages/Bonus";
import Reimbursement from "./modules/payroll/pages/Reimbursement";

// Attendance Module
import AttendanceLayout from "./modules/attendance/pages/AttendanceLayout";
import { AttendanceDashboard } from "./modules/attendance/pages/AttendanceDashboard";
import AttendanceCalendar from "./modules/attendance/pages/AttendanceCalendar";
import AttendanceHistory from "./modules/attendance/pages/AttendanceHistory";
import Regularization from "./modules/attendance/pages/Regularization";
import ShiftManagement from "./modules/attendance/pages/ShiftManagement";
import Overtime from "./modules/attendance/pages/Overtime";
import GeoFence from "./modules/attendance/pages/GeoFence";
import LiveTracking from "./modules/attendance/pages/LiveTracking";
import TopologyView from "./modules/attendance/pages/TopologyView";
import { GeofenceSettings } from "./modules/attendance/pages/GeofenceSettings";

// Notification Module
import NotificationLayout from "./modules/notifications/pages/NotificationLayout";
import Inbox from "./modules/notifications/pages/Inbox";
import Alerts from "./modules/notifications/pages/Alerts";
import Announcements from "./modules/notifications/pages/Announcements";

// Placeholder for org settings
const OrgSettingsPage = () => <h2>Org / Settings Module</h2>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<DashboardLayout />}>
          {/* 1. Home Dashboard */}
          <Route index element={<DashboardRouter />} /> 
          <Route path="jobs" element={<JobOpenings />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="headcount" element={<HeadcountAnalytics />} />
          {/* 2. Me / Attendance Module */}
          <Route path="attendance" element={<AttendanceLayout />}>
            <Route index element={<AttendanceDashboard />} />
            <Route path="calendar" element={<AttendanceCalendar />} />
            <Route path="history" element={<AttendanceHistory />} />
            <Route path="regularization" element={<Regularization />} />
            <Route path="shifts" element={<ShiftManagement />} />
            <Route path="overtime" element={<Overtime />} />
            <Route path="geofence" element={<GeoFence />} />
            <Route path="tracking" element={<LiveTracking />} />
            <Route path="topology" element={<TopologyView />} />
          </Route>

          {/* Leave Module */}
          <Route path="leave" element={<LeaveLayout />}>
            <Route index element={<LeaveBalance />} />
            <Route path="apply" element={<ApplyLeave />} />
            <Route path="calendar" element={<LeaveCalendar />} />
            <Route path="policy" element={<LeavePolicy />} />
            <Route path="history" element={<LeaveHistory />} />
            <Route path="approval" element={<LeaveApproval />} />
          </Route>
          
          {/* 3. Inbox / Notifications Module */}
          <Route path="notifications" element={<NotificationLayout />}>
            <Route index element={<Inbox />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>
          
          {/* 4. My Team / Employees Module */}
          <Route path="employees" element={<Employee />}>
            <Route index element={<EmployeeList />} />
            <Route path="add" element={<AddEmployee />} />
            <Route path="departments" element={<Departments />} />
            <Route path="designations" element={<Designations />} />
            <Route path="chart" element={<OrganizationChart />} />
            <Route path="edit/:id" element={<EditEmployee />} />
            <Route path="profile/:id" element={<EmployeeProfile />} />
          </Route>
          
          {/* 5. My Finance / Payroll & Expenses */}
          <Route path="payroll" element={<PayrollLayout />}>
            <Route index element={<PayrollProcessing />} />
            <Route path="payslips" element={<Payslips />} />
            <Route path="structure" element={<SalaryStructure />} />
            <Route path="taxes" element={<TaxDetails />} />
            <Route path="bonus" element={<Bonus />} />
            <Route path="reimbursements" element={<Reimbursement />} />
          </Route>

          <Route path="expenses" element={<ExpenseLayout />}>
            <Route index element={<ExpenseHistory />} />
            <Route path="submit" element={<SubmitExpense />} />
            <Route path="status" element={<ReimbursementStatus />} />
            <Route path="approvals" element={<ExpenseApproval />} />
            <Route path="reports" element={<ExpenseReports />} />
            <Route path="policy" element={<ExpensePolicy />} />
          </Route>
          
          {/* 6. Org Settings */}
          <Route path="settings" element={<OrgSettingsPage />} />

          {/* 7. Geofence Configuration Management */}
          <Route path="geofence" element={<GeofenceSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;