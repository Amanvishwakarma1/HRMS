import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAttendance } from '../hooks/useAttendance';
import { attendanceService } from '../services/attendanceService';
import { locationService } from '../services/locationService';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceHistory from './AttendanceHistory';
import MapComponent from '../components/MapComponent';
import { 
  LogIn, 
  LogOut, 
  History, 
  Calendar, 
  BarChart2, 
  FileText, 
  Map, 
  Network, 
  ChevronRight, 
  Clock, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Users,
  MapPin,
  X,
  Compass
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Custom Map Marker styling helper to avoid asset issues
const getPinStyle = (color, label) => {
  return new L.DivIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: ${color}; 
                    color: white; padding: 4px 8px; border-radius: 20px; 
                    font-size: 10px; font-weight: bold; white-space: nowrap;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1.5px solid white;">
          ${label}
        </div>
        <div style="width: 0; height: 0; border-left: 4px solid transparent; 
                    border-right: 4px solid transparent; border-top: 6px solid ${color};"></div>
      </div>`,
    className: 'emp-marker-pin',
    iconSize: [100, 40],
    iconAnchor: [50, 38]
  });
};

const ChangeMapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

export const AttendanceDashboard = () => {
  const { todayRecord, executeCheckIn, executeCheckOut, clockIn, clockOut, loading, officeConfig } = useAttendance();
  
  const storedUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "User", role: "employee", id: 4 };
  const isEmployee = storedUser.role === 'employee';

  // Dashboard Sub-Tabs & View Modes
  const [subTab, setSubTab] = useState(isEmployee ? 'clock-io' : 'summary'); // 'summary' | 'clock-io'
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'employee-list' | 'employee-tracking'
  const [selectedEmployeeForTracking, setSelectedEmployeeForTracking] = useState(null);
  
  // Database State Variables
  const [employees, setEmployees] = useState([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(
    isEmployee ? String(storedUser.id) : (localStorage.getItem('active_employee_id') || '2')
  );
  const [todayAttendanceRecords, setTodayAttendanceRecords] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState(null);

  // Geolocation & Action States
  const [userLoc, setUserLoc] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [isInsideGeofence, setIsInsideGeofence] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const [listFilter, setListFilter] = useState('All');
  const [mapVisible, setMapVisible] = useState(false);

  // Dynamic Shift Effort Timer State
  const [shiftSeconds, setShiftSeconds] = useState(0);

  const isCheckedIn = !!(todayRecord && todayRecord.isClockedIn);
  const isPostgresMode = !isNaN(currentEmployeeId);

  // Path Simulator Helper
  const getMockPathForEmployee = (employeeId, employeeName) => {
    const baseLat = officeConfig?.lat || 28.6282;
    const baseLng = officeConfig?.lng || 77.3898;
    
    // Hash based on name to generate distinct consistent path coordinates
    const hash = (employeeName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || Number(employeeId);
    const seedX = ((hash % 15) - 7.5) / 1000;
    const seedY = (((hash + 3) % 15) - 7.5) / 1000;
    
    return [
      {
        type: 'REMOTE CLOCK IN',
        time: '09:12 AM',
        lat: baseLat + seedX,
        lng: baseLng + seedY,
        locationName: 'Noida Expressway Link Node'
      },
      {
        type: 'LOCATION PUNCH',
        time: '11:35 AM',
        lat: baseLat + seedX + 0.002,
        lng: baseLng + seedY - 0.001,
        locationName: 'Sector 125 Crossing'
      },
      {
        type: 'LOCATION PUNCH',
        time: '02:18 PM',
        lat: baseLat + seedX + 0.004,
        lng: baseLng + seedY - 0.003,
        locationName: 'Sector 62 Business Plaza'
      },
      {
        type: 'LOCATION PUNCH',
        time: '04:46 PM',
        lat: baseLat + seedX + 0.006,
        lng: baseLng + seedY - 0.005,
        locationName: 'Noida Office Gate Node'
      }
    ];
  };

  // 1. Fetch employee list or single profile
  useEffect(() => {
    if (isEmployee) {
      axios.get(`/api/employees/EMP-00${storedUser.id}`)
        .then(res => {
          if (res.data && res.data.success) {
            setEmployeeProfile(res.data.data);
            setEmployees([res.data.data]);
          }
        })
        .catch(err => console.error("Error loading employee profile:", err));
    } else {
      axios.get('/api/attendance/employees')
        .then(res => {
          if (res.data && res.data.success) {
            setEmployees(res.data.data);
            const list = res.data.data;
            if (list.length > 0 && !list.some(e => String(e.id) === String(currentEmployeeId))) {
              const firstId = String(list[0].id);
              setCurrentEmployeeId(firstId);
              localStorage.setItem('active_employee_id', firstId);
            }
          }
        })
        .catch(err => console.error("Error loading employees:", err));
    }
  }, [isEmployee]);

  // 2. Fetch today's records for all employees or single employee to calculate stats
  const fetchTodayStats = () => {
    if (isEmployee) {
      axios.get(`/api/attendance/history/${storedUser.id}`)
        .then(res => {
          if (res.data && res.data.success) {
            const todayStr = new Date().toISOString().split('T')[0];
            const filtered = res.data.data.filter(r => {
              const recordDate = new Date(r.check_in_time).toISOString().split('T')[0];
              return recordDate === todayStr;
            });
            setTodayAttendanceRecords(filtered);
          }
        })
        .catch(err => console.error("Error loading employee today logs:", err));
    } else {
      axios.get('/api/attendance/all')
        .then(res => {
          if (res.data && res.data.success) {
            const todayStr = new Date().toISOString().split('T')[0];
            const filtered = res.data.data.filter(r => {
              const recordDate = new Date(r.check_in_time).toISOString().split('T')[0];
              return recordDate === todayStr;
            });
            setTodayAttendanceRecords(filtered);
          }
        })
        .catch(err => console.error("Error loading today logs:", err));
    }
  };

  useEffect(() => {
    fetchTodayStats();
    window.addEventListener('attendance_update', fetchTodayStats);
    return () => window.removeEventListener('attendance_update', fetchTodayStats);
  }, [isEmployee]);

  // 3. Fetch recent logs & history records for selected employee
  useEffect(() => {
    const loadRecentLogs = () => {
      const activeId = Number(currentEmployeeId);
      if (!isNaN(activeId)) {
        attendanceService.getAttendanceHistory(activeId)
          .then(data => {
            const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentLogs(sorted);
          })
          .catch(err => console.error("Error loading recent logs:", err));
      }
    };

    loadRecentLogs();
    
    window.addEventListener('storage', loadRecentLogs);
    window.addEventListener('attendance_update', loadRecentLogs);
    return () => {
      window.removeEventListener('storage', loadRecentLogs);
      window.removeEventListener('attendance_update', loadRecentLogs);
    };
  }, [currentEmployeeId, todayRecord]);

  // 4. Track browser geolocation & geofence distance
  useEffect(() => {
    if (!navigator.geolocation) return;

    const officeLat = officeConfig?.lat || 28.6282;
    const officeLng = officeConfig?.lng || 77.3898;
    const allowedRadius = officeConfig?.radius || 200;

    const geoId = navigator.geolocation.watchPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserLoc({ lat: uLat, lng: uLng });

        // Calculate distance in meters using Haversine formula
        const R = 6371000;
        const dLat = (uLat - officeLat) * Math.PI / 180;
        const dLng = (uLng - officeLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(officeLat * Math.PI / 180) * Math.cos(uLat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        setCurrentDistance(distance);
        setIsInsideGeofence(distance <= allowedRadius);
      },
      (err) => console.log("Geolocation tracking warning:", err.message),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(geoId);
  }, [officeConfig]);

  // 5. Dynamic Clock / Timer ticking
  useEffect(() => {
    if (!isCheckedIn) {
      // Reset clock to 0 after clock-out
      setShiftSeconds(0);
      return;
    }

    const checkInTime = todayRecord?.checkIn;
    if (!checkInTime) {
      setShiftSeconds(0);
      return;
    }

    const startTime = new Date(checkInTime);
    const trackingTimer = setInterval(() => {
      const elapsed = Math.floor((new Date() - startTime) / 1000);
      setShiftSeconds(elapsed > 0 ? elapsed : 0);
    }, 1000);

    return () => clearInterval(trackingTimer);
  }, [isCheckedIn, todayRecord]);

  // Helper format methods
  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatTimeStr = (isoStr) => {
    if (!isoStr) return '--:--:--';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr; 
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const handleEmployeeChange = (id) => {
    setCurrentEmployeeId(id);
    localStorage.setItem('active_employee_id', id);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('attendance_update'));
  };

  // Check In sequence
  const handleCheckInSequence = async () => {
    setMapVisible(true);
    setActionLoading(true);
    setError(null);
    setStatusMessage('');
    
    let location = { lat: officeConfig.lat, lng: officeConfig.lng }; 
    try {
      const browserLoc = await locationService.getCurrentLocation();
      location = { lat: browserLoc.lat, lng: browserLoc.lng };
    } catch (err) {
      console.warn("Using default office location lock due to GPS access warning:", err.message);
    }

    try {
      let res;
      if (isPostgresMode) {
        res = await executeCheckIn(location);
      } else {
        res = await clockIn('Office', location.lat, location.lng);
      }
      setStatusMessage(res.message || "Validation Authenticated. Gate operational metrics actively logging system status.");
      setError(null);
    } catch (err) {
      setError(err.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Check Out sequence
  const handleCheckOutSequence = async () => {
    setMapVisible(true);
    setActionLoading(true);
    setError(null);
    setStatusMessage('');
    
    let location = { lat: officeConfig.lat, lng: officeConfig.lng }; 
    try {
      const browserLoc = await locationService.getCurrentLocation();
      location = { lat: browserLoc.lat, lng: browserLoc.lng };
    } catch (err) {
      console.warn("Using default office location lock due to GPS access warning:", err.message);
    }

    try {
      let res;
      if (isPostgresMode) {
        res = await executeCheckOut(location);
      } else {
        res = await clockOut();
      }
      setStatusMessage(res.message || "Departure verification protocol completed.");
      setError(null);
    } catch (err) {
      setError(err.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Get active employee details
  const activeEmployee = employees.find(e => String(e.id) === String(currentEmployeeId)) || { name: 'User', role: 'Employee' };

  // Calculate live summary stats
  const totalEmployeesCount = employees.length;
  const earlyArrivalsCount = todayAttendanceRecords.filter(r => r.status === 'Present').length;
  const lateArrivalsCount = todayAttendanceRecords.filter(r => r.status === 'Late').length;
  const notInYetCount = Math.max(0, totalEmployeesCount - todayAttendanceRecords.length);
  const wfhCount = 0;
  const onDutyCount = 0;
  const remoteClockInCount = todayAttendanceRecords.filter(r => r.geofence_verified === false).length;
  const holidayCount = 0;

  // Calculate employee-specific personal stats from recentLogs
  const personalLogs = recentLogs || [];
  const empPresentDays = personalLogs.filter(log => log.status === 'Present' || log.status === 'Late').length;
  const empAbsentDays = personalLogs.filter(log => log.status === 'Absent').length;
  const empLeaveDays = personalLogs.filter(log => log.status === 'On Leave' || log.status === 'Leave').length;
  const empLateArrivals = personalLogs.filter(log => log.status === 'Late').length;

  const empTotalWorkingHours = personalLogs.reduce((sum, log) => {
    return sum + parseFloat(log.activeHours || 0);
  }, 0).toFixed(1);

  const empOvertimeHours = personalLogs.reduce((sum, log) => {
    const hours = parseFloat(log.activeHours || 0);
    return sum + (hours > 8.0 ? (hours - 8.0) : 0.0);
  }, 0).toFixed(1);

  // Today's details
  const todayStatus = todayRecord?.status || 'Absent';
  const todayPunchIn = todayRecord?.checkInStr || '--:--:--';
  const todayPunchOut = todayRecord?.checkOutStr || '--:--:--';
  const todayWorkingHours = isCheckedIn ? formatTimer(shiftSeconds) : (todayRecord?.accumulatedTime ? ((todayRecord.accumulatedTime / 3600).toFixed(2) + " hrs") : '--:--:--');

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col justify-center items-center">
        <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm text-slate-500 font-bold mt-5 tracking-widest uppercase animate-pulse">Syncing Security Core...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* ================= VIEWPORT SUMMARY DASHBOARD MODE ================= */}
      {viewMode === 'summary' && (
        isEmployee ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Employee Self-Service Dashboard */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Employee Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Employee Name</span>
                  <span className="font-bold text-slate-800">{employeeProfile?.name || 'Aman Vishwakarma'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Employee ID</span>
                  <span className="font-mono font-bold text-slate-800">{employeeProfile?.id || 'EMP-004'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Designation</span>
                  <span className="font-bold text-slate-800">{employeeProfile?.designation || 'Fullstack Developer'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Department</span>
                  <span className="font-bold text-slate-800">{employeeProfile?.department || 'Engineering'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Reporting Manager</span>
                  <span className="font-bold text-slate-800">Charlie Davis (Project Manager)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Current Shift</span>
                  <span className="font-bold text-slate-800">General Shift (09:00 AM - 06:30 PM)</span>
                </div>
              </div>
            </div>

            {/* Today's Punch & Clock Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Today's Stats Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-700">Today's Attendance Status</h3>
                
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      todayStatus === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      todayStatus === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {todayStatus}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Today's Work Hours</span>
                    <span className="font-mono font-bold text-slate-800 text-lg">{todayWorkingHours}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">First In Time</span>
                    <span className="font-mono font-bold text-slate-800">{todayPunchIn}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Last Out Time</span>
                    <span className="font-mono font-bold text-slate-800">{todayPunchOut}</span>
                  </div>
                </div>
              </div>

              {/* Clock In / Out Controller Component (Relocated clock-io tab for employees) */}
              <div className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row gap-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm h-full justify-between items-stretch">
                  
                  {/* Left inner panel */}
                  <div className="flex-1 flex flex-col justify-between gap-4">
                    <div 
                      style={{ backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}
                      className="border border-slate-200 rounded-xl p-5 text-center relative overflow-hidden shadow-inner flex-1 flex flex-col justify-center"
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Today's Total Active Time</span>
                      <h2 className={`text-4xl font-mono font-bold mt-2 ${isCheckedIn ? 'text-emerald-600 drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]' : 'text-slate-800'}`}>
                        {formatTimer(shiftSeconds)}
                      </h2>
                    </div>

                    <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between"><span className="text-slate-500">Perimeter Limit:</span> <span className="font-bold text-slate-700">{officeConfig.radius}m</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Distance from Office:</span> <span className={`font-bold ${isInsideGeofence ? 'text-emerald-600' : 'text-rose-600'}`}>{Math.round(currentDistance)}m ({isInsideGeofence ? 'Inside' : 'Outside'})</span></div>
                    </div>
                  </div>

                  {/* Right inner panel */}
                  <div className="flex-1 flex flex-col justify-between gap-4">
                    {isCheckedIn ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 text-white rounded-full"><ShieldCheck size={16} /></div>
                        <div>
                          <h4 className="font-bold text-[12px] text-emerald-950">Active Punch Session</h4>
                          <p className="text-emerald-700/80 mt-0.5">Your attendance is verified present inside boundaries.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-3">
                        <div className="p-2 bg-slate-500 text-white rounded-full"><Clock size={16} /></div>
                        <div>
                          <h4 className="font-bold text-[12px] text-slate-900">Secure Entry Console</h4>
                          <p className="text-slate-500 mt-0.5">Please clock-in to record shift timings.</p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                        <ShieldAlert size={14} />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {!isCheckedIn ? (
                        <button
                          onClick={handleCheckInSequence}
                          disabled={actionLoading}
                          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs p-3.5 rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          {actionLoading ? "Processing check-in..." : "Clock In / Check-In"}
                        </button>
                      ) : (
                        <button
                          onClick={handleCheckOutSequence}
                          disabled={actionLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-3.5 rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          {actionLoading ? "Processing check-out..." : "Clock Out / Check-Out"}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Dashboard Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              
              {/* Present Days */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Present Days</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{empPresentDays} Days</h3>
              </div>

              {/* Absent Days */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Absent Days</span>
                <h3 className="text-2xl font-extrabold text-rose-600 mt-2">{empAbsentDays} Days</h3>
              </div>

              {/* Leave Days */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Leave Days</span>
                <h3 className="text-2xl font-extrabold text-amber-500 mt-2">{empLeaveDays} Days</h3>
              </div>

              {/* Overtime Hours */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Overtime Hours</span>
                <h3 className="text-2xl font-extrabold text-blue-600 mt-2">{empOvertimeHours} Hrs</h3>
              </div>

              {/* Total Working Hours */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Working Hours</span>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">{empTotalWorkingHours} Hrs</h3>
              </div>

            </div>

            {/* Monthly Attendance Summary Metrics */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-700 mb-4">Monthly Attendance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Monthly Present Days</span>
                  <span className="text-lg font-bold text-slate-800 mt-1 block">{empPresentDays}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Monthly Absent Days</span>
                  <span className="text-lg font-bold text-slate-800 mt-1 block">{empAbsentDays}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Monthly Leave Days</span>
                  <span className="text-lg font-bold text-slate-800 mt-1 block">{empLeaveDays}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Monthly Late Arrivals</span>
                  <span className="text-lg font-bold text-slate-800 mt-1 block">{empLateArrivals}</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-6">
            {/* Sub-navigation bar inside Dashboard */}
            <div className="flex gap-4 border-b border-slate-200 pb-px">
              <button 
                onClick={() => setSubTab('summary')}
                className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all ${subTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Attendance Summary
              </button>
              <button 
                onClick={() => setSubTab('clock-io')}
                className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all ${subTab === 'clock-io' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                My Clock In/Out
              </button>
            </div>

          {/* Render Sub Tab: Summary Stats */}
          {subTab === 'summary' && (
            <div className="space-y-8">
              
              {/* Today's Attendance stats section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-slate-700">Today's attendance stats</h2>
                  <div className="flex gap-2">
                    <select className="text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-600 outline-none">
                      <option>All Departments</option>
                    </select>
                    <select className="text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-600 outline-none">
                      <option>All Locations</option>
                    </select>
                  </div>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* Total Employees */}
                  <div 
                    onClick={() => { setViewMode('employee-list'); setListFilter('All'); }}
                    className="bg-white border border-slate-200/80 hover:border-blue-400 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group"
                  >
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Total Employees</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalEmployeesCount}</h3>
                    <span className="text-xs text-blue-600 font-semibold mt-3 inline-block group-hover:underline">View Employees →</span>
                  </div>

                  {/* Early/On Time Arrivals */}
                  <div 
                    onClick={() => { setViewMode('employee-list'); setListFilter('Present'); }}
                    className="bg-white border border-slate-200/80 hover:border-emerald-400 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group"
                  >
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Early/On Time Arrivals</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{earlyArrivalsCount}</h3>
                    <span className="text-xs text-emerald-600 font-semibold mt-3 inline-block group-hover:underline">View Employees →</span>
                  </div>

                  {/* Late Arrivals */}
                  <div 
                    onClick={() => { setViewMode('employee-list'); setListFilter('Late'); }}
                    className="bg-white border border-slate-200/80 hover:border-amber-400 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group"
                  >
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Late Arrivals</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{lateArrivalsCount}</h3>
                    <span className="text-xs text-amber-600 font-semibold mt-3 inline-block group-hover:underline">View Employees →</span>
                  </div>

                  {/* Not In Yet */}
                  <div 
                    onClick={() => { setViewMode('employee-list'); setListFilter('Not In'); }}
                    className="bg-white border border-slate-200/80 hover:border-rose-400 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group"
                  >
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Not In Yet</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{notInYetCount}</h3>
                    <span className="text-xs text-rose-600 font-semibold mt-3 inline-block group-hover:underline">View Employees →</span>
                  </div>

                  {/* Work From Home */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Work From Home</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{wfhCount}</h3>
                  </div>

                  {/* On Duty */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">On Duty</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{onDutyCount}</h3>
                  </div>

                  {/* Remote Clock-In */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Remote Clock-In</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{remoteClockInCount}</h3>
                  </div>

                  {/* Holiday / Weekly Off */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Holiday/Weekly Off</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{holidayCount}</h3>
                  </div>

                </div>
              </div>

              {/* Attendance for past dates section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-slate-700">Attendance for past dates</h2>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">10 Jun 2026 - 16 Jun 2026</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Employees Present</span>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-2">53.92%</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Ratio of employees present inside limits.</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Avg. Work Hours Spent</span>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-2">3h 33m/day</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Average shift effort logged.</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Avg. Overtime Hours</span>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-2">0h 21m/day</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Average overtime cycles compiled.</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Total Attendance Discrepancies</span>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-2">0</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Pending regularizations currently queued.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Render Sub Tab: Check In / Check Out (relocated dark sidebar console) */}
          {subTab === 'clock-io' && (
            <div className="flex flex-col lg:flex-row gap-6 bg-white p-2 rounded-2xl border border-slate-200/60 overflow-hidden">
              {/* Internal Sidebar */}
              <div className="w-full lg:w-[300px] shrink-0 bg-slate-950 text-white p-6 rounded-xl flex flex-col gap-5 shadow-xl border border-slate-800">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Select Employee Context</label>
                  <select 
                    value={currentEmployeeId}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all shadow-inner"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div 
                  style={{ backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}
                  className="border border-slate-200 rounded-xl p-5 text-center relative overflow-hidden shadow-inner"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Aggregated Effort Time</span>
                  <h2 className={`text-3xl font-mono font-bold mt-3 transition-all duration-500 ${isCheckedIn ? 'text-emerald-600 drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]' : 'text-slate-800'}`}>
                    {formatTimer(shiftSeconds)} <span className="text-[11px] font-sans font-normal text-slate-500">HRS</span>
                  </h2>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-300 text-[10px] text-slate-500">
                    <span>Target: <b className="text-slate-700">08:00 Hours</b></span>
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`}></span>
                      <span className="text-slate-600">{isCheckedIn ? 'Active Run' : 'Dormant Matrix'}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2.5">Operational Core</span>
                  <div className="bg-slate-900 rounded-xl p-2 text-xs text-slate-400 font-semibold space-y-1">
                    <div className="flex justify-between p-2"><span className="text-slate-500">Selected Node:</span> <span className="text-slate-200">{activeEmployee.name}</span></div>
                    <div className="flex justify-between p-2"><span className="text-slate-500">Safe Perimeter:</span> <span className="text-slate-200">{officeConfig.radius}m</span></div>
                  </div>
                </div>
              </div>

              {/* Check-In Right Panel */}
              <div className="flex-1 p-4 space-y-6">
                
                {isCheckedIn ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4.5 rounded-xl text-xs font-semibold flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 text-white rounded-full animate-pulse"><ShieldCheck size={16} /></div>
                    <div>
                      <h4 className="font-bold text-[13px] text-emerald-950">Validation Authenticated</h4>
                      <p className="text-emerald-700/80 mt-0.5">Gate operational metrics actively logging system output for {activeEmployee.name}.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 text-slate-800 p-4.5 rounded-xl text-xs font-semibold flex items-center gap-3">
                    <div className="p-2 bg-slate-500 text-white rounded-full"><Clock size={16} /></div>
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900">Secure Entry Authentication</h4>
                      <p className="text-slate-500 mt-0.5">Initialize workspace access verification sequence via verified telemetry link.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
                    <ShieldAlert size={16} />
                    <span><b>Error:</b> {error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  
                  {mapVisible && (
                    <div className="xl:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-2 h-[350px]">
                      <MapComponent userLocation={userLoc} officeConfig={officeConfig} />
                    </div>
                  )}

                  <div className={`${mapVisible ? 'xl:col-span-4' : 'xl:col-span-12'} space-y-4`}>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1.5">Action Controls</h3>
                      
                      <div className="text-xs space-y-2">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Gate Entry</span>
                          <span className="font-mono font-bold text-slate-800">{todayRecord?.checkInStr || '--:--:--'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Gate Departure</span>
                          <span className="font-mono font-bold text-slate-800">{todayRecord?.checkOutStr || '--:--:--'}</span>
                        </div>
                      </div>

                      {!isCheckedIn ? (
                        <button
                          onClick={handleCheckInSequence}
                          disabled={actionLoading}
                          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs p-3 rounded-xl transition-all shadow-md cursor-pointer mt-2"
                        >
                          {actionLoading ? "Telemetry check..." : "Authenticate Check-In"}
                        </button>
                      ) : (
                        <button
                          onClick={handleCheckOutSequence}
                          disabled={actionLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-3 rounded-xl transition-all shadow-md cursor-pointer mt-2"
                        >
                          {actionLoading ? "Sign-off check..." : "Deauthenticate Check-Out"}
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          </div>
        )
      )}


      {/* ================= VIEWPORT EMPLOYEE LIST MODE ================= */}
      {viewMode === 'employee-list' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <button 
                onClick={() => setViewMode('summary')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                ← Back to Dashboard Summary
              </button>
              <h2 className="text-lg font-bold text-slate-800 mt-2">Employee Attendance Context List</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select a worker node to inspect details or track their physical positioning matrix path.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Filter Status:</span>
              <select 
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-600 outline-none"
              >
                <option value="All">All Employees</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Not In">Not Checked In</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Department / Role</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Today's Status</th>
                  <th className="p-4 text-center">Telemetry Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees
                  .filter(emp => {
                    const todayRecord = todayAttendanceRecords.find(r => String(r.id) === String(emp.id));
                    const status = todayRecord ? todayRecord.status : 'Not In';
                    
                    if (listFilter === 'All') return true;
                    if (listFilter === 'Present') return status === 'Present';
                    if (listFilter === 'Late') return status === 'Late';
                    if (listFilter === 'Not In') return status === 'Not In';
                    return true;
                  })
                  .map(emp => {
                    const todayRecord = todayAttendanceRecords.find(r => String(r.id) === String(emp.id));
                    const status = todayRecord ? todayRecord.status : 'Not In';
                    
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{emp.name}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">ID: {emp.id}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-700 block">{emp.role}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Engineering</span>
                        </td>
                        <td className="p-4 text-slate-500 font-mono">{emp.email || `${emp.name.toLowerCase().replace(' ', '')}@company.com`}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            status === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                            'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {status === 'Not In' ? 'Not Checked In' : status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => { setSelectedEmployeeForTracking(emp); setViewMode('employee-tracking'); }}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Track live punch path"
                          >
                            <MapPin size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

        </div>
      )}


      {/* ================= VIEWPORT EMPLOYEE PATH TRACKING MODE ================= */}
      {viewMode === 'employee-tracking' && selectedEmployeeForTracking && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <button 
                onClick={() => setViewMode('employee-list')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                ← Back to Employee List
              </button>
              <h2 className="text-lg font-bold text-slate-800 mt-2 uppercase font-mono tracking-tight text-blue-600">
                MAP VIEW - 17 JUN 2026 - {selectedEmployeeForTracking.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Plotting telemetry punch paths and coordinates connected to Noida geofence.</p>
            </div>
            
            <button 
              onClick={() => setViewMode('employee-list')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Map layout split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Punch path items list */}
            <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col gap-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Target Operator</span>
                <h3 className="text-base font-bold text-white">{selectedEmployeeForTracking.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{selectedEmployeeForTracking.role}</span>
              </div>

              {/* Punch Timeline list */}
              <div className="flex-1 space-y-6 relative border-l border-slate-800 pl-4.5 ml-2.5">
                {getMockPathForEmployee(selectedEmployeeForTracking.id, selectedEmployeeForTracking.name).map((punch, idx) => (
                  <div key={idx} className="relative group">
                    
                    {/* Glowing active node dot */}
                    <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-blue-400 font-mono tracking-wider block">{punch.type}</span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{punch.time}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{punch.locationName}</p>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Lat: {punch.lat.toFixed(5)} | Lng: {punch.lng.toFixed(5)}</span>
                    </div>

                  </div>
                ))}
              </div>

              <div className="border-t border-slate-800/80 pt-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest text-center">
                Geofence Lock: Enforced (300m)
              </div>
            </div>

            {/* Right: Map Viewport showing punches & Polyline */}
            <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-3xl p-3 shadow-inner h-[580px] relative">
              <MapContainer 
                center={[officeConfig?.lat || 28.6282, officeConfig?.lng || 77.3898]} 
                zoom={14} 
                style={{ height: '100%', width: '100%', borderRadius: '24px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                
                <ChangeMapCenter center={[officeConfig?.lat || 28.6282, officeConfig?.lng || 77.3898]} />
                
                {/* Geofence Perimeter circle */}
                <Circle 
                  center={[officeConfig?.lat || 28.6282, officeConfig?.lng || 77.3898]} 
                  radius={officeConfig?.radius || 300} 
                  pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 1.5 }}
                />

                {/* Office Center node */}
                <Marker 
                  position={[officeConfig?.lat || 28.6282, officeConfig?.lng || 77.3898]}
                  icon={getPinStyle('#3B82F6', `🏢 HQ Node`)}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>Office Geofence Node</strong><br/>
                      Allowed Radius: {officeConfig?.radius || 300}m
                    </div>
                  </Popup>
                </Marker>

                {/* Plot employee punches */}
                {getMockPathForEmployee(selectedEmployeeForTracking.id, selectedEmployeeForTracking.name).map((punch, idx) => (
                  <Marker 
                    key={idx}
                    position={[punch.lat, punch.lng]}
                    icon={getPinStyle(punch.type === 'REMOTE CLOCK IN' ? '#10B981' : '#EAB308', `Punch ${idx + 1}`)}
                  >
                    <Popup>
                      <div className="text-xs font-mono">
                        <strong className="text-blue-600 block">{punch.type}</strong>
                        Time: {punch.time}<br/>
                        Node: {punch.locationName}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Connect path with glowing polyline */}
                <Polyline 
                  positions={getMockPathForEmployee(selectedEmployeeForTracking.id, selectedEmployeeForTracking.name).map(p => [p.lat, p.lng])}
                  pathOptions={{ color: '#2563EB', weight: 3, dashArray: '5, 10', opacity: 0.7 }}
                />

              </MapContainer>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AttendanceDashboard;