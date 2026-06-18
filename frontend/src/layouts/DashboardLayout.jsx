// layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Ensure path is correct

const DashboardLayout = () => (
  <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
    <Sidebar />
    <main style={{ flex: 1, padding: '24px', overflowY: 'auto', height: '100vh', backgroundColor: '#f1f5f9' }}>
      <Outlet /> 
    </main>
  </div>
);
export default DashboardLayout;