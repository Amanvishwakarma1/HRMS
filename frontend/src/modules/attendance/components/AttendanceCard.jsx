import React from 'react';
import { StatusBadge } from './StatusBadge';
import { formatTimeShort } from '../utils/timeCalculator';

export const AttendanceCard = ({ title, record, children }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 transition-all">
      <div className="flex justify-between items-start border-b border-slate-50 pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">{title || 'Lifecycle Tracking Node'}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Date: {record?.date || new Date().toISOString().split('T')[0]}</p>
        </div>
        {record && <StatusBadge status={record.status} />}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100/50">
          <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Shift Gate Entry</span>
          <span className="text-base font-bold text-slate-700 mt-1 block font-mono">
            {record?.checkIn ? formatTimeShort(record.checkIn) : '--:--'}
          </span>
        </div>
        <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100/50">
          <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Shift Gate Departure</span>
          <span className="text-base font-bold text-slate-700 mt-1 block font-mono">
            {record?.checkOut ? formatTimeShort(record.checkOut) : '--:--'}
          </span>
        </div>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
};