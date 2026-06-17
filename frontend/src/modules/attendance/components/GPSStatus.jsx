import React from 'react';

export const GPSStatus = ({ location, loading, error }) => {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${error ? 'bg-rose-50 text-rose-600' : location ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-800">System Telemetry Matrix</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? 'Polling tracking hardware constellation...' : error ? 'Hardware error state' : location ? 'GPS Locking Stream Active' : 'Idle validation state'}
            </p>
          </div>
        </div>
        {location && !loading && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
            ±{Math.round(location.accuracy || 0)}m precision
          </span>
        )}
      </div>

      {location && !error && !loading && (
        <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-2 gap-2 text-xs text-slate-500 font-mono">
          <div>LAT: <span className="text-slate-700">{location.lat.toFixed(5)}</span></div>
          <div>LNG: <span className="text-slate-700">{location.lng.toFixed(5)}</span></div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs font-medium text-rose-600 flex items-center bg-rose-50/50 p-2 rounded border border-rose-100">
          <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};