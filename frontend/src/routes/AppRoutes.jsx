import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AttendanceDashboard } from "../modules/attendance/pages/AttendanceDashboard";
import { CheckIn } from "../modules/attendance/pages/CheckIn";
import { CheckOut } from "../modules/attendance/pages/CheckOut";
import { AttendanceHistory } from "../modules/attendance/pages/AttendanceHistory";
import { MapView } from "../modules/attendance/pages/MapView";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AttendanceDashboard />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/history" element={<AttendanceHistory />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </BrowserRouter>
  );
}