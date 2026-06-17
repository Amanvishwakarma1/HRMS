import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, 
  User, 
  Inbox, 
  Users, 
  Wallet, 
  Building2, 
  LogOut, 
  Box 
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [hoveredPath, setHoveredPath] = useState(null);
  const [isHoveringLogout, setIsHoveringLogout] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "admin" };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const menuItems = [
    { name: "Home", path: "/", icon: <Home size={20} strokeWidth={1.5} /> },
    { name: "Me", path: "/attendance", icon: <User size={20} strokeWidth={1.5} /> },
    { name: "Inbox", path: "/notifications", icon: <Inbox size={20} strokeWidth={1.5} /> },
    { name: "My Team", path: "/employees", icon: <Users size={20} strokeWidth={1.5} /> },
    { name: "My Finance", path: "/payroll", icon: <Wallet size={20} strokeWidth={1.5} /> },
    { name: "Org", path: "/settings", icon: <Building2 size={20} strokeWidth={1.5} /> },
  ];

  // The styles object is now correctly defined within the component scope
  const styles = {
    sidebar: {
      width: "280px",
      height: "calc(100vh - 32px)",
      margin: "16px",
      boxSizing: "border-box",
      background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "24px",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      color: "#ffffff",
      position: "relative",
      overflow: "hidden"
    },
    ambientGlow: {
      position: "absolute",
      top: "-80px",
      left: "-80px",
      width: "200px",
      height: "200px",
      background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
      pointerEvents: "none"
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "0 24px",
      marginBottom: "40px",
    },
    logoIcon: { color: "#0ea5e9" },
    logoText: {
      fontSize: "22px",
      fontWeight: "800",
      color: "#ffffff",
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
      fontWeight: isActive ? "600" : "500",
      color: isActive ? "#ffffff" : (isHovered ? "#ffffff" : "#94a3b8"),
      backgroundColor: isActive ? "#0ea5e9" : (isHovered ? "rgba(255,255,255,0.06)" : "transparent"),
      boxShadow: isActive ? "0 4px 12px rgba(14, 165, 233, 0.3)" : "none",
      transform: isHovered && !isActive ? "translateX(4px)" : "none",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    }),
    profileCard: {
      marginTop: "auto",
      margin: "0 16px",
      padding: "12px",
      backgroundColor: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
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
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onMouseEnter={() => setHoveredPath(item.path)}
            onMouseLeave={() => setHoveredPath(null)}
            style={({ isActive }) => styles.navItem(isActive, hoveredPath === item.path)}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={styles.profileCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={styles.avatar}>
            {storedUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>{storedUser.username}</p>
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