import React from 'react';

export const StatusBadge = ({ status }) => {
  const mapStyle = () => {
    switch (String(status).toLowerCase()) {
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'late':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'absent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md border ${mapStyle()}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {status || 'Unknown'}
    </span>
  );
};