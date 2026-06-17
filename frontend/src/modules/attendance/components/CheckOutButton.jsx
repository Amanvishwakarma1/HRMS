import React from 'react';

export const CheckOutButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm p-3.5 rounded-xl shadow-sm transition-all"
    >
      Deauthenticate Check-Out
    </button>
  );
};