import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';

export const AttendanceReport = () => {
  const [metrics, setMetrics] = useState({ present: 0, late: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceService.getAttendanceHistory().then((data) => {
      let p = 0, l = 0, aggregatedMs = 0;
      data.forEach(r => {
        if (r.status === 'Present') p++;
        if (r.status === 'Late') l++;
        if (r.checkIn && r.checkOut) {
          aggregatedMs += (new Date(r.checkOut) - new Date(r.checkIn));
        }
      });
      setMetrics({
        present: p,
        late: l,
        totalHours: Math.round(aggregatedMs / 3600000)
      });
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Operational Productivity Report</h2>
        <p className="text-xs text-slate-400 mt-0.5">Aggregated administrative intelligence telemetry analysis framework.</p>
      </div>

      {loading ? (
        <div className="h-40 flex justify-center items-center">
          <span className="text-xs font-medium text-slate-400 animate-pulse">Assembling global vectors...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Perfect Attestations</span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600">{metrics.present} <span className="text-xs font-medium text-slate-400">sessions</span></div>
            <p className="text-[11px] text-slate-400 mt-2">Zero perimeter boundary exception flags raised.</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Late Gate Violations</span>
            <div className="mt-2 text-3xl font-extrabold text-amber-500">{metrics.late} <span className="text-xs font-medium text-slate-400">events</span></div>
            <p className="text-[11px] text-slate-400 mt-2">Sign-ins processed outside predefined core schedule windows.</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Cumulative Run Effort</span>
            <div className="mt-2 text-3xl font-extrabold text-slate-800">{metrics.totalHours} <span className="text-xs font-medium text-slate-400">hours</span></div>
            <p className="text-[11px] text-slate-400 mt-2">Net logged production hours compiled in active database storage.</p>
          </div>
        </div>
      )}
    </div>
  );
};