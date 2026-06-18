import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';

export const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [saving, setSaving] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'User', role: 'employee' };
  const isEmployee = storedUser.role === 'employee';

  useEffect(() => {
    attendanceService.getShifts().then(setShifts);
  }, []);

  const handleShiftSelection = async (shiftId) => {
    if (isEmployee) return;
    setSaving(true);
    const updated = shifts.map(s => ({ ...s, active: s.id === shiftId }));
    setShifts(updated);
    await attendanceService.updateShifts(updated);
    setSaving(false);
  };

  const shiftsToDisplay = isEmployee ? shifts.filter(s => s.active) : shifts;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          {isEmployee ? 'My Assigned Shift' : 'Corporate Shift Allocation'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {isEmployee 
            ? 'Below are the details of your current active shift schedule.' 
            : 'Configure and assign the active schedule template constraints below.'}
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isEmployee ? 'Shift Details' : 'Available Operations Matrix'}
          </span>
          {saving && <span className="text-[10px] text-blue-600 font-bold animate-pulse">Syncing shifts...</span>}
        </div>
        <div className="divide-y divide-slate-50">
          {shiftsToDisplay.map((shift) => (
            <div key={shift.id} className="p-5 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
              <div>
                <h4 className="text-sm font-bold text-slate-800">{shift.name}</h4>
                <p className="text-xs font-mono text-slate-400 mt-1">Operational Window: {shift.startTime} - {shift.endTime}</p>
              </div>
              {isEmployee ? (
                <span className="text-xs px-3 py-1.5 rounded-lg font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                  Assigned
                </span>
              ) : (
                <button
                  onClick={() => handleShiftSelection(shift.id)}
                  disabled={shift.active || saving}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                    shift.active 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold cursor-default' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm active:scale-95'
                  }`}
                >
                  {shift.active ? 'Active Standard' : 'Deploy Target'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;
