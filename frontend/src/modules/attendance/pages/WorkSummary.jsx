import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';

export const WorkSummary = () => {
  const [summary, setSummary] = useState({ totalLogs: 0, complianceRatio: 100 });

  useEffect(() => {
    attendanceService.getAttendanceHistory().then((data) => {
      if (!data || data.length === 0) return;
      
      const presents = data.filter(r => r.status === 'Present').length;
      setSummary({
        totalLogs: data.length,
        complianceRatio: Math.round((presents / data.length) * 100)
      });
    }).catch(err => console.error("Error fetching attendance history:", err));
  }, []);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-800">Operational Consistency Audit</h3>
        <p className="text-xs text-slate-400 mt-0.5">Analysis mapping aggregate historical compliance parameters.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observed Run Horizon</span>
          <span className="text-2xl font-extrabold text-slate-800 mt-1 block font-mono">{summary.totalLogs} Days</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Alignment Ratio</span>
          <span className="text-2xl font-extrabold text-blue-600 mt-1 block font-mono">{summary.complianceRatio}%</span>
        </div>
      </div>

      <div className="p-4 bg-blue-50/50 border border-blue-100 text-blue-800 rounded-xl text-xs font-medium">
        All active structural tokens evaluated match standard parameters. System optimization operations performing optimally inside expected variation tolerances.
      </div>
    </div>
  );
};

export default WorkSummary;