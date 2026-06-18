import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';

const TopologyView = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeEmployeeId = localStorage.getItem('active_employee_id') || '2';
  const isCheckedIn = localStorage.getItem('is_checked_in') === 'true';

  useEffect(() => {
    setLoading(true);
    axios.get('/api/attendance/employees')
      .then(res => {
        if (res.data && res.data.success) {
          setEmployees(res.data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading employees for topology:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-xs text-slate-400 font-mono uppercase tracking-widest animate-pulse">
        Initializing Topology Grid...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Geofence Node Network Topology</h2>
        <p className="text-xs text-slate-400 mt-1">Topology mapping active worker terminals connecting to Noida Headquarters central node.</p>
      </div>

      {/* Glowing SVG Topology diagram */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[500px] text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-4 left-4 text-[10px] text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
          <Activity size={12} className="animate-pulse" /> Topology Matrix Shield Active
        </div>
        
        <svg width="400" height="400" className="w-full max-w-[400px]">
          {/* Glowing rings */}
          <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(14, 165, 233, 0.04)" strokeWidth="2" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(16, 185, 129, 0.06)" strokeWidth="2" className="animate-pulse" />
          <circle cx="200" cy="200" r="60" fill="none" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="2" />
          
          {/* Connecting lines */}
          {employees.map((emp, idx) => {
            const angle = (idx * 360) / employees.length;
            const rad = (angle * Math.PI) / 180;
            const x = 200 + 130 * Math.cos(rad);
            const y = 200 + 130 * Math.sin(rad);
            const isEmpActive = String(emp.id) === String(activeEmployeeId) && isCheckedIn;
            
            return (
              <g key={emp.id}>
                <line 
                  x1="200" 
                  y1="200" 
                  x2={x} 
                  y2={y} 
                  stroke={isEmpActive ? "#10b981" : "#334155"} 
                  strokeWidth={isEmpActive ? "2.5" : "1.5"} 
                  strokeDasharray="5,5"
                />
                <circle cx={x} cy={y} r="16" fill="#0f172a" stroke={isEmpActive ? "#10b981" : "#334155"} strokeWidth="2" />
                <text x={x} y={y + 3.5} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
                  {emp.name.charAt(0)}
                </text>
                <text x={x} y={y + 24} textAnchor="middle" fill="#94a3b8" fontSize="8">
                  {emp.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
          
          {/* Office Hub Circle */}
          <circle cx="200" cy="200" r="30" fill="#030712" stroke="#0ea5e9" strokeWidth="3" />
          <circle cx="200" cy="200" r="20" fill="rgba(14, 165, 233, 0.15)" />
          <text x="200" y="203.5" textAnchor="middle" fill="#0ea5e9" fontSize="10" fontWeight="extrabold">
            HUB
          </text>
        </svg>
        
        <div className="mt-8 text-center space-y-2 max-w-sm">
          <h4 className="text-sm font-bold tracking-wider uppercase text-slate-200">Terminal Node Distribution</h4>
          <p className="text-xs text-slate-400">
            Secure visual mapping of employee nodes authenticated against Noida Headquarters.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopologyView;
