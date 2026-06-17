import React from 'react';
import { calculateDistance } from "../utils/CalculationDistance";

export const GeofenceStatus = ({ userLocation, officeConfig }) => {
  if (!officeConfig) return null;

  const distance = userLocation 
    ? calculateDistance(userLocation.lat, userLocation.lng, officeConfig.lat, officeConfig.lng)
    : null;

  const isInside = distance !== null ? distance <= officeConfig.radius : null;

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isInside === true ? 'bg-emerald-50 text-emerald-600' : isInside === false ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-800">Geofence Enclosure Shield</h4>
            <p className="text-xs text-slate-400 mt-0.5">{officeConfig.officeName}</p>
          </div>
        </div>
        <div>
          {isInside === true && <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded font-bold">AUTHORIZED</span>}
          {isInside === false && <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded font-bold">BREACH/OUTSIDE</span>}
          {isInside === null && <span className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2 py-1 rounded font-bold">WAITING COORDINATES</span>}
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-600 flex flex-col space-y-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
        <div className="flex justify-between">
          <span className="text-slate-400">Allowed Perimeter Bounds:</span>
          <span className="font-semibold text-slate-700">{officeConfig.radius} meters</span>
        </div>
        {distance !== null && (
          <div className="flex justify-between border-t border-slate-100 pt-1.5">
            <span className="text-slate-400">Current Computed Range:</span>
            <span className={`font-semibold ${isInside ? 'text-emerald-600' : 'text-rose-600'}`}>{Math.round(distance)} meters out</span>
          </div>
        )}
      </div>
    </div>
  );
};