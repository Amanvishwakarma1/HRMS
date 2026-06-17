import React from 'react';

export const CheckInButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm p-3.5 rounded-xl shadow-sm transition-all"
    >
      Authenticate Check-In
    </button>
  );
};