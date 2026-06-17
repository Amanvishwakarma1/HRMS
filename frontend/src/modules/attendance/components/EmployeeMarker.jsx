import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export const EmployeeMarker = ({ location }) => {
  if (!location) return null;

  const userSvg = `
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="14" fill="#2563EB" stroke="white" stroke-width="2.5" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.15));"/>
      <circle cx="18" cy="14" r="4" fill="white"/>
      <path d="M11 23C11 20.2386 14.134 18 18 18C21.866 18 25 20.2386 25 23" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  const userIcon = L.divIcon({
    html: userSvg,
    className: 'custom-worker-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  return (
    <Marker position={[location.lat, location.lng]} icon={userIcon}>
      <Popup>
        <div className="text-xs p-1">
          <p className="font-bold text-blue-700">Active Live Tracking Node</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Updated: {new Date(location.timestamp || Date.now()).toLocaleTimeString()}</p>
        </div>
      </Popup>
    </Marker>
  );
};