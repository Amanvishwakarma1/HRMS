import React from 'react';
import { useLocation } from '../hooks/useLocation';
import { useAttendance } from '../hooks/useAttendance';
import  MapComponent  from '../components/MapComponent';

export const MapView = () => {
  const { location } = useLocation(true);
  const { officeConfig } = useAttendance();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Spatial Topology Map View</h2>
        <p className="text-xs text-slate-400 mt-0.5">Isolate asset positioning relative to structural geofencing nodes.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm h-[500px]">
        <MapComponent userLocation={location} officeConfig={officeConfig} />
      </div>
    </div>
  );
};