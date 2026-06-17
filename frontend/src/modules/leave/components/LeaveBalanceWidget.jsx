import React from 'react';

const LeaveBalanceWidget = ({ balance }) => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <h3 className="font-semibold text-blue-800">Current Balance</h3>
      <p className="text-2xl font-bold">{balance || 0} Days</p>
    </div>
  );
};

export default LeaveBalanceWidget;