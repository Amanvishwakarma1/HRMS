import React from 'react';

const LeaveCard = ({ leaveType, days, status }) => {
  return (
    <div className="p-4 border rounded shadow-sm bg-white">
      <h3 className="font-bold text-lg">{leaveType || "Leave Type"}</h3>
      <p>Days: {days || 0}</p>
      <p className="text-sm text-gray-500">Status: {status || "Pending"}</p>
    </div>
  );
};

export default LeaveCard;