import React from 'react';

const LeaveTable = ({ leaveRequests }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Duration</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests?.length > 0 ? (
            leaveRequests.map((request, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{request.type}</td>
                <td className="p-2">{request.startDate} to {request.endDate}</td>
                <td className="p-2">{request.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">No leave records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveTable;