import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

const DashboardRouter = () => {
  // Check localStorage for the logged-in user
  const storedUser = localStorage.getItem('currentUser');
  
  // Security Check: If no user is logged in, force them to the login page
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);

  // Render the correct dashboard based on the real user session
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'hr':
      return <HRDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
    default:
      return <EmployeeDashboard />;
  }
};

export default DashboardRouter;