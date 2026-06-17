import React from 'react';
import LeaveTable from '../components/LeaveTable';

const LeaveHistory = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leave History</h1>
      <LeaveTable leaveRequests={[]} /> {/* Pass historical requests here */}
    </div>
  );
};

export default LeaveHistory;