<<<<<<< HEAD
import React from 'react';
import { attendanceService } from '../services/attendanceService';
import { Clock, Info, AlertTriangle, HelpCircle, CheckSquare } from 'lucide-react';

const ShiftManagement = () => {
  const shift = attendanceService.getShiftDetails();

  const styles = {
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '24px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px'
    },
    title: {
      margin: '0 0 16px 0',
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px'
    },
    label: {
      color: '#64748b',
      fontWeight: '500'
    },
    value: {
      color: '#1e293b',
      fontWeight: '600'
    },
    dayOffCell: (isOff) => ({
      padding: '10px 14px',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '13px',
      fontWeight: 'bold',
      backgroundColor: isOff ? '#f1f5f9' : '#e0f2fe',
      color: isOff ? '#64748b' : '#0369a1',
      border: `1px solid ${isOff ? '#cbd5e1' : '#bae6fd'}`
    })
  };

  const weekdays = [
    { name: 'Monday', off: false },
    { name: 'Tuesday', off: false },
    { name: 'Wednesday', off: false },
    { name: 'Thursday', off: false },
    { name: 'Friday', off: false },
    { name: 'Saturday', off: true },
    { name: 'Sunday', off: true }
  ];

  return (
    <div>
      <div style={styles.card}>
        <h3 style={styles.title}>
          <Clock size={20} color="#0ea5e9" />
          Active Work Shift Schedule
        </h3>
        
        <div style={styles.grid}>
          <div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Shift Name</span>
              <span style={styles.value}>{shift.name}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Shift Code</span>
              <span style={styles.value}>{shift.code}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Official Timings</span>
              <span style={styles.value}>{shift.timings}</span>
            </div>
          </div>
          
          <div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Work Duration</span>
              <span style={styles.value}>{shift.workDuration}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Break Duration</span>
              <span style={styles.value}>{shift.breakDuration.split(' ')[0]} Hour</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Flexi-Time Rules</span>
              <span style={styles.value}>{shift.flexiTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Weekly Off calendar */}
        <div style={styles.card}>
          <h3 style={styles.title}>
            <CheckSquare size={20} color="#0ea5e9" />
            Weekly Off Days
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
            Check your weekly off calendar days. Checking in on week offs qualifies as Overtime.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {weekdays.map((day) => (
              <div key={day.name} style={styles.dayOffCell(day.off)}>
                {day.name.slice(0, 3)}
                <div style={{ fontSize: '10px', fontWeight: 'normal', marginTop: '2px' }}>
                  {day.off ? 'Off' : 'Working'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Policy Warnings */}
        <div style={styles.card}>
          <h3 style={styles.title}>
            <AlertTriangle size={20} color="#eab308" />
            Attendance Policy Alerts
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#475569' }}>
              <Info size={16} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Late Punch-In:</strong> Checked in after 09:30 AM will be flagged. Three flags a month will deduct a half-day leave.
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#475569' }}>
              <Info size={16} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Short Work Hours:</strong> Working less than 4 hours triggers an automatic "Half Day" status, and less than 7 hours triggers a "Short Hours" warning.
              </span>
            </div>
          </div>
=======
import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';

export const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    attendanceService.getShifts().then(setShifts);
  }, []);

  const handleShiftSelection = async (shiftId) => {
    setSaving(true);
    const updated = shifts.map(s => ({ ...s, active: s.id === shiftId }));
    setShifts(updated);
    await attendanceService.updateShifts(updated);
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Corporate Shift Allocation</h2>
        <p className="text-xs text-slate-400 mt-0.5">Configure and assign the active schedule template constraints below.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Operations Matrix</span>
          {saving && <span className="text-[10px] text-blue-600 font-bold animate-pulse">Syncing shifts...</span>}
        </div>
        <div className="divide-y divide-slate-50">
          {shifts.map((shift) => (
            <div key={shift.id} className="p-5 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
              <div>
                <h4 className="text-sm font-bold text-slate-800">{shift.name}</h4>
                <p className="text-xs font-mono text-slate-400 mt-1">Operational Window: {shift.startTime} - {shift.endTime}</p>
              </div>
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
            </div>
          ))}
>>>>>>> 077d9bac6d2e1f9ec4139220792812a0a3ab0c43
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default ShiftManagement;
=======
};
>>>>>>> 077d9bac6d2e1f9ec4139220792812a0a3ab0c43
