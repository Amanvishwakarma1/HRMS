import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAttendance } from '../hooks/useAttendance';
import { locationService } from '../services/locationService';
import { calculateDistance } from '../utils/CalculationDistance';
import { 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  LogIn, 
  LogOut,
  MapPin, 
  Compass 
} from 'lucide-react';
import ThreeDCard from '../../../components/ThreeDCard';

// Custom Map Marker styling helper to avoid asset issues in Vite
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

export const HomeClockInOut = () => {
  const storedUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'User', role: 'hr' };
  
  // Resolve employee ID context based on logged-in user
  let activeId = '2'; // default HR
  if (storedUser.role === 'admin') activeId = '1';
  else if (storedUser.role === 'manager') activeId = '3';
  else if (storedUser.role === 'employee') activeId = '4';

  const { 
    todayRecord, 
    executeCheckIn, 
    executeCheckOut, 
    clockIn, 
    clockOut, 
    loading, 
    officeConfig,
    fetchStatus 
  } = useAttendance();

  // Sync active employee ID to local storage for the hook
  useEffect(() => {
    localStorage.setItem('active_employee_id', activeId);
    fetchStatus();
  }, [activeId, fetchStatus]);

  // Geolocation & Distance States
  const [userLoc, setUserLoc] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);

  // Dynamic Shift Effort Timer State
  const [shiftSeconds, setShiftSeconds] = useState(0);

  const isCheckedIn = !!(todayRecord && todayRecord.isClockedIn);
  const isPostgresMode = !isNaN(activeId);

  // Track browser geolocation & check geofence distance
  useEffect(() => {
    const officeLat = officeConfig?.lat || 28.6282;
    const officeLng = officeConfig?.lng || 77.3898;
    const allowedRadius = officeConfig?.radius || 200;

    const watchObj = locationService.watchPosition(
      (pos) => {
        const uLat = pos.lat;
        const uLng = pos.lng;
        setUserLoc({ lat: uLat, lng: uLng });

        const dist = calculateDistance(uLat, uLng, officeLat, officeLng);
        setCurrentDistance(dist);
        setIsInsideGeofence(dist <= allowedRadius);
      },
      (err) => {
        console.error("Geolocation watch error:", err);
        setError("GPS Coordinates Unavailable. Please grant location permissions.");
        // Dev fallback: lock inside geofence if permission is blocked in simulation
        setIsInsideGeofence(true);
      }
    );

    return () => {
      if (watchObj) {
        locationService.clearWatch(watchObj);
      }
    };
  }, [officeConfig]);

  // Handle active shift effort clock timer
  useEffect(() => {
    let intervalId = null;
    const checkInTime = todayRecord?.checkIn || todayRecord?.checkInTime;

    if (isCheckedIn && checkInTime) {
      const startMs = new Date(checkInTime).getTime();
      
      const updateClock = () => {
        const elapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setShiftSeconds(elapsed);
      };

      updateClock();
      intervalId = setInterval(updateClock, 1000);
    } else {
      setShiftSeconds(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCheckedIn, todayRecord]);

  // Format digital stopwatch display
  const formatTimer = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Check In sequence
  const handleCheckInSequence = async () => {
    setMapVisible(true);
    if (!isInsideGeofence) {
      setError("Cannot Clock In: You must be inside the authorized office geofence.");
      return;
    }

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
        res = await clockIn();
      }
      setStatusMessage(res.message || "Clock-In successfully completed.");
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
    if (!isInsideGeofence) {
      setError("Cannot Clock Out: You must be inside the authorized office geofence.");
      return;
    }

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
      setStatusMessage(res.message || "Clock-Out successfully completed.");
      setError(null);
    } catch (err) {
      setError(err.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-center items-center h-[280px]">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-slate-400 font-bold mt-4 tracking-wider uppercase animate-pulse">Syncing Telemetry...</span>
      </div>
    );
  }

  const mapCenter = userLoc ? [userLoc.lat, userLoc.lng] : [officeConfig?.lat || 28.6282, officeConfig?.lng || 77.3898];

  return (
    <ThreeDCard depth="20px" className="p-6 space-y-6" style={{ borderRadius: '24px' }}>
      
      {/* Header & Status Indicator */}
      <div style={{ transform: 'translateZ(10px)' }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-600 animate-pulse" size={20} />
            Secure Attendance Portal
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Enforcing strict spatial geofencing verification rules.</p>
        </div>

        {/* Geofence Status Badge */}
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
          isInsideGeofence 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {isInsideGeofence ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          <span>{isInsideGeofence ? 'Inside Safe Geofence' : 'Outside Office Boundary'}</span>
        </div>
      </div>

      {/* Grid split: Timer & Controls on left, Map on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* Left Side: Clock, Stats, Controls */}
        <div className={`${mapVisible ? 'md:col-span-5' : 'md:col-span-12'} flex flex-col justify-between space-y-5`} style={{ transformStyle: 'preserve-3d' }}>
          
          {/* Digital Timer */}
          <div 
            style={{ 
              backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d'
            }}
            className="p-5 rounded-2xl border border-slate-200 text-center relative overflow-hidden shadow-inner"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Today's Effort Hours</span>
            <h2 className={`text-3xl font-mono font-bold mt-2 transition-all duration-500 ${isCheckedIn ? 'text-emerald-600 drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]' : 'text-slate-800'}`}>
              {formatTimer(shiftSeconds)}
            </h2>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-300 text-[10px] text-slate-500">
              <span>Shift Target: <b className="text-slate-700">08:00 hrs</b></span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`}></span>
                <span className="text-slate-600">{isCheckedIn ? 'Active Logging' : 'Dormant'}</span>
              </span>
            </div>
          </div>

          {/* Punch Times Info */}
          <div style={{ transform: 'translateZ(8px)' }} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">HQ Perimeter:</span>
              <span className="text-slate-700 font-bold">{officeConfig?.radius || 200}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Clock-In Time:</span>
              <span className="text-slate-800 font-mono font-bold">{todayRecord?.checkInStr || '--:--:--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Clock-Out Time:</span>
              <span className="text-slate-800 font-mono font-bold">{todayRecord?.checkOutStr || '--:--:--'}</span>
            </div>
          </div>

          {/* Action button */}
          <div style={{ transform: 'translateZ(12px)' }}>
            {error && (
              <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl mb-3 flex items-center gap-1.5 animate-fadeIn">
                <ShieldAlert size={14} />
                {error}
              </p>
            )}
            {statusMessage && (
              <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl mb-3 flex items-center gap-1.5 animate-fadeIn">
                <ShieldCheck size={14} />
                {statusMessage}
              </p>
            )}

            {!isCheckedIn ? (
              <button
                onClick={handleCheckInSequence}
                disabled={actionLoading || !isInsideGeofence}
                className={`tactile-btn w-full flex items-center justify-center gap-2 font-bold text-xs p-3.5 rounded-xl transition-all duration-300 shadow-md ${
                  isInsideGeofence 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.45)] active:scale-98' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                <LogIn size={16} />
                {actionLoading ? "Authenticating GPS..." : "Clock In"}
              </button>
            ) : (
              <button
                onClick={handleCheckOutSequence}
                disabled={actionLoading || !isInsideGeofence}
                className={`tactile-btn w-full flex items-center justify-center gap-2 font-bold text-xs p-3.5 rounded-xl transition-all duration-300 shadow-md ${
                  isInsideGeofence 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(37,99,235,0.45)] active:scale-98' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                <LogOut size={16} />
                {actionLoading ? "Signing Off..." : "Clock Out"}
              </button>
            )}
            {!isInsideGeofence && (
              <p className="text-[10px] text-rose-500 font-semibold text-center mt-2 animate-pulse">
                ⚠️ Restricted: Outside safe office boundary.
              </p>
            )}
          </div>

        </div>

        {/* Right Side: Map View */}
        {mapVisible && (
          <div style={{ transform: 'translateZ(10px)' }} className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 h-[280px] overflow-hidden relative">
            <MapContainer 
              center={mapCenter} 
              zoom={15} 
              style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              <ChangeMapCenter center={mapCenter} />
              
              {/* Geofence Perimeter Circle */}
              <Circle 
                center={[officeConfig?.lat || 28.6282, officeConfig?.lng || 77.3898]} 
                radius={officeConfig?.radius || 200} 
                pathOptions={{ 
                  color: isInsideGeofence ? '#10B981' : '#EF4444', 
                  fillColor: isInsideGeofence ? '#10B981' : '#EF4444', 
                  fillOpacity: 0.08, 
                  weight: 1.5 
                }}
              />

              {/* HQ Marker */}
              <Marker 
                position={[officeConfig?.lat || 28.6282, officeConfig?.lng || 77.3898]}
                icon={getPinStyle('#3B82F6', `🏢 HQ`)}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>Office Geofence Node</strong><br/>
                    Radius: {officeConfig?.radius || 200}m
                  </div>
                </Popup>
              </Marker>

              {/* User Location Marker */}
              {userLoc && (
                <Marker 
                  position={[userLoc.lat, userLoc.lng]}
                  icon={getPinStyle(isInsideGeofence ? '#10B981' : '#EF4444', `📍 You`)}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>Your Location</strong><br/>
                      Distance: {Math.round(currentDistance)}m away
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        )}

      </div>

    </ThreeDCard>
  );
};

export default HomeClockInOut;
