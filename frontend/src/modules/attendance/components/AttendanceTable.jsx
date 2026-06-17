import React from 'react';
import { StatusBadge } from './StatusBadge';

export const AttendanceTable = ({ records = [], loading }) => {
  
  // Clean formatting utility for plain timestamps or full dates
  const executeSafeTimeShort = (timeVal) => {
    if (!timeVal || timeVal === '--:--:--' || timeVal === '--:--') return '--:--';
    try {
      if (typeof timeVal === 'string' && timeVal.includes('T')) {
        return timeVal.split('T')[1].substring(0, 5);
      }
      const components = String(timeVal).split(':');
      if (components.length >= 2) {
        return `${components[0]}:${components[1]}`;
      }
      return timeVal;
    } catch (e) {
      return '--:--';
    }
  };

  // Safe runtime processing module for work vector calculations
  const executeSafeWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || checkIn === '--:--:--' || checkIn === '--:--' || 
        !checkOut || checkOut === '--:--:--' || checkOut === '--:--') {
      return '--:--';
    }
    try {
      if (String(checkIn).includes('T') && String(checkOut).includes('T')) {
        const diffMs = new Date(checkOut) - new Date(checkIn);
        const diffMins = Math.max(0, Math.floor(diffMs / 60000));
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      }

      const normalizeToMinutes = (str) => {
        if (typeof str === 'string' && str.includes('T')) {
          str = str.split('T')[1].split('.')[0];
        }
        const tokens = String(str).split(':');
        return (parseInt(tokens[0], 10) || 0) * 60 + (parseInt(tokens[1], 10) || 0);
      };

      const startTotal = normalizeToMinutes(checkIn);
      const endTotal = normalizeToMinutes(checkOut);
      const delta = endTotal - startTotal;
      const standardDelta = delta > 0 ? delta : 0;

      const hrs = Math.floor(standardDelta / 60);
      const mins = standardDelta % 60;
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    } catch (err) {
      return '--:--';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[250px] bg-white rounded-xl border border-slate-100 flex flex-col justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-slate-400 mt-2 font-medium">Reconciling internal tracking databases...</span>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="min-h-[250px] bg-white rounded-xl border border-slate-100 flex flex-col justify-center items-center p-6 text-center">
        <p className="text-sm font-semibold text-slate-700">No Historical Matches Located</p>
        <p className="text-xs text-slate-400 max-w-sm mt-1">There are no structural attendance validation records present inside this runtime context.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              <th className="py-3 px-4">Calendar Key</th>
              <th className="py-3 px-4">Check-In Event</th>
              <th className="py-3 px-4">Check-Out Event</th>
              <th className="py-3 px-4">Duration Vector</th>
              <th className="py-3 px-4 text-right">Status State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {records.map((rec, idx) => (
              <tr key={rec.id || rec.date || idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-900">{rec.date}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">
                  {rec.checkIn ? executeSafeTimeShort(rec.checkIn) : '--:--'}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600">
                  {rec.checkOut && rec.checkOut !== null && rec.checkOut !== '--:--:--' ? executeSafeTimeShort(rec.checkOut) : '--:--'}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600">
                  {rec.checkIn ? executeSafeWorkingHours(rec.checkIn, rec.checkOut) : '--:--'}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <StatusBadge status={rec.status || 'Present'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};