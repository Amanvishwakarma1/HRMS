import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Attendance Module</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <Link to="/checkin">Check In</Link>
        <Link to="/checkout">Check Out</Link>
        <Link to="/history">History</Link>
        <Link to="/map">Map View</Link>
      </div>
    </div>
  );
}