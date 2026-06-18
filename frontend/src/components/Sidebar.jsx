import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  User, 
  Inbox, 
  Users, 
  Wallet, 
  Building2, 
  LogOut, 
  Box,
  Calendar,
  MapPin,
  Clock,
  History,
  ShieldAlert,
  Map
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(null);
  const [isHoveringLogout, setIsHoveringLogout] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "admin" };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  let menuItems = [];

  if (storedUser.role === 'employee') {
    menuItems = [
      { name: "Dashboard", path: "/", icon: <Home size={20} strokeWidth={1.5} /> },
      { name: "Attendance", path: "/attendance", icon: <Clock size={20} strokeWidth={1.5} /> },
      { name: "Calendar", path: "/attendance/calendar", icon: <Calendar size={20} strokeWidth={1.5} /> },
      { name: "Punch History", path: "/attendance/history", icon: <History size={20} strokeWidth={1.5} /> },
      { name: "Shift & Schedule", path: "/attendance/shifts", icon: <Box size={20} strokeWidth={1.5} /> },
      { name: "Overtime", path: "/attendance/overtime", icon: <ShieldAlert size={20} strokeWidth={1.5} /> },
      { name: "Live Tracking", path: "/attendance/tracking", icon: <Map size={20} strokeWidth={1.5} /> },
      { name: "Leave", path: "/leave", icon: <Calendar size={20} strokeWidth={1.5} /> },
      { name: "Expenses", path: "/expenses", icon: <Wallet size={20} strokeWidth={1.5} /> },
      { name: "Profile", path: `/employees/profile/${storedUser.id || 4}`, icon: <User size={20} strokeWidth={1.5} /> },
    ];
  } else {
    menuItems = [
      { name: "Home", path: "/", icon: <Home size={20} strokeWidth={1.5} /> },
      { name: "Me", path: "/attendance", icon: <User size={20} strokeWidth={1.5} /> },
      { name: "Leave", path: "/leave", icon: <Calendar size={20} strokeWidth={1.5} /> },
      { name: "Inbox", path: "/notifications", icon: <Inbox size={20} strokeWidth={1.5} /> },
      { name: "My Team", path: "/employees", icon: <Users size={20} strokeWidth={1.5} /> },
      { name: "My Finance", path: "/payroll", icon: <Wallet size={20} strokeWidth={1.5} /> },
      { name: "Expenses", path: "/expenses", icon: <Wallet size={20} strokeWidth={1.5} /> },
    ];

    // Only HR and Admin see the Geofence Config page
    if (storedUser.role === 'hr' || storedUser.role === 'admin') {
      menuItems.push({ name: "Geofence", path: "/geofence", icon: <MapPin size={20} strokeWidth={1.5} /> });
    }
  }

  const isTabActive = (item) => {
    if (item.path === "/") {
      return location.pathname === "/";
    }
    if (item.path === "/payroll") {
      return location.pathname.startsWith("/payroll");
    }
    return location.pathname.startsWith(item.path);
  };

  // The styles object is now correctly defined within the component scope
  const styles = {
    sidebar: {
      width: "280px",
      height: "calc(100vh - 32px)",
      margin: "16px",
      boxSizing: "border-box",
      background: "linear-gradient(135deg, rgba(245, 247, 250, 0.85) 0%, rgba(195, 207, 226, 0.8) 100%)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.45)",
      borderRadius: "24px",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      color: "#1e293b",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.5s ease",
      perspective: "1000px",
      transformStyle: "preserve-3d"
    },
    ambientGlow: {
      position: "absolute",
      top: "-80px",
      left: "-80px",
      width: "200px",
      height: "200px",
      background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)",
      pointerEvents: "none"
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "0 24px",
      marginBottom: "40px",
      transform: "translateZ(20px)"
    },
    logoIcon: { color: "#0ea5e9" },
    logoText: {
      fontSize: "22px",
      fontWeight: "800",
      color: "#0f172a",
      margin: 0,
      letterSpacing: "0.5px"
    },
    navItem: (isActive, isHovered) => ({
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "12px 16px",
      margin: "0 16px 6px 16px",
      borderRadius: "14px",
      textDecoration: "none",
      fontWeight: isActive ? "700" : "500",
      color: isActive ? "#0f172a" : (isHovered ? "#0f172a" : "#475569"),
      backgroundImage: isActive ? "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" : "none",
      backgroundColor: !isActive && isHovered ? "rgba(15, 23, 42, 0.04)" : "transparent",
      border: isActive ? "1px solid rgba(255, 255, 255, 0.55)" : "1px solid transparent",
      boxShadow: isActive 
        ? "0 12px 24px -4px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)" 
        : (isHovered ? "0 6px 12px -3px rgba(15, 23, 42, 0.05)" : "none"),
      transform: isActive 
        ? "translateY(-2px) scale(1.02) translateZ(15px)" 
        : (isHovered ? "translateY(-2px) scale(1.015) translateZ(8px)" : "translateZ(0px)"),
      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    }),
    profileCard: {
      marginTop: "auto",
      margin: "0 16px",
      padding: "12px",
      backgroundColor: "rgba(15, 23, 42, 0.04)",
      border: "1px solid rgba(15, 23, 42, 0.08)",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backdropFilter: "blur(10px)"
    },
    avatar: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "14px",
      color: "#ffffff",
    },
    logoutBtn: {
      background: isHoveringLogout ? "rgba(239, 68, 68, 0.1)" : "transparent",
      border: "none",
      color: "#ef4444",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s"
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.ambientGlow} />

      <div style={styles.logoContainer}>
        <Box style={styles.logoIcon} size={28} strokeWidth={2} />
        <p style={styles.logoText}>HRMS</p>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {menuItems.map((item) => {
          const isActive = isTabActive(item);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
              style={styles.navItem(isActive, hoveredPath === item.path)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={styles.profileCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={styles.avatar}>
            {storedUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{storedUser.username}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>{storedUser.role}</p>
          </div>
        </div>
        <button 
          style={styles.logoutBtn} 
          onClick={handleLogout}
          onMouseEnter={() => setIsHoveringLogout(true)}
          onMouseLeave={() => setIsHoveringLogout(false)}
        >
          <LogOut size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;