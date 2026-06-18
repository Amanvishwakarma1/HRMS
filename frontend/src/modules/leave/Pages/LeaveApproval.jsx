import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/leaveService';

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check the logged-in user's role from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee' };
  
  // 2. Define which roles are allowed to approve/reject
  const canApprove = ['admin', 'manager', 'hr'].includes(currentUser.role?.toLowerCase());

  if (!canApprove) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', background: 'linear-gradient(to bottom, rgba(213, 222, 231, 0.75) 0%, rgba(232, 235, 242, 0.75) 50%, rgba(226, 231, 237, 0.75) 100%), linear-gradient(to bottom, rgba(0,0,0,0.02) 50%, rgba(255,255,255,0.02) 61%, rgba(0,0,0,0.02) 73%), linear-gradient(33deg, rgba(255,255,255,0.20) 0%, rgba(0,0,0,0.20) 100%)', backgroundBlendMode: 'normal,color-burn', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.45)', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h2 style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px 0' }}>Access Denied</h2>
        <p style={{ color: '#4b5563', margin: 0, fontSize: '15px' }}>You do not have permissions to access this screen.</p>
      </div>
    );
  }

  const fetchLeaves = async () => {
    setIsLoading(true);
    // Fetching all leaves so employees can see their Approved/Rejected statuses
    const response = await leaveService.getAllLeaves();
    if (response.success) {
      setLeaves(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id, action) => {
    // Optimistically update the UI to feel fast
    const originalLeaves = [...leaves];
    
    // Update the specific leave's status locally
    setLeaves(leaves.map(leave => 
      leave.id === id ? { ...leave, status: action } : leave
    ));

    const response = await leaveService.updateLeaveStatus(id, action);
    
    if (!response.success) {
      // Revert if the server fails
      setLeaves(originalLeaves);
      alert('Failed to update status. Please try again.');
    }
  };

  const styles = {
    card: { background: 'linear-gradient(to bottom, rgba(213, 222, 231, 0.75) 0%, rgba(232, 235, 242, 0.75) 50%, rgba(226, 231, 237, 0.75) 100%), linear-gradient(to bottom, rgba(0,0,0,0.02) 50%, rgba(255,255,255,0.02) 61%, rgba(0,0,0,0.02) 73%), linear-gradient(33deg, rgba(255,255,255,0.20) 0%, rgba(0,0,0,0.20) 100%)', backgroundBlendMode: 'normal,color-burn', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.45)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.05)', borderBottom: '2px solid rgba(15, 23, 42, 0.08)', color: '#0f172a', fontWeight: '700', fontSize: '14px' },
    td: { padding: '16px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', color: '#334155', fontSize: '14px' },
    approveBtn: { padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '8px' },
    rejectBtn: { padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
  };

  // Helper function to color-code the status badges
  const getStatusBadgeStyle = (status) => {
    const baseStyle = { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' };
    if (status === 'Approved') return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
    if (status === 'Rejected') return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
    return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' }; // Pending
  };

  if (isLoading) return <p style={{ color: '#666' }}>Loading leave requests...</p>;

  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>
        {canApprove ? "Action Required: Leave Approvals" : "My Leave History"}
      </h2>
      
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Leave Type</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr key={leave.id}>
                  <td style={styles.td}>
                    <strong>{leave.employeeName}</strong>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>Applied: {leave.appliedOn}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px' }}>
                      {leave.type}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {leave.startDate} to {leave.endDate}
                  </td>
                  <td style={styles.td}>{leave.reason}</td>
                  
                  <td style={styles.td}>
                    {/* 3. CONDITIONAL RENDERING: Buttons for privileged users, Badge for employees */}
                    {canApprove && leave.status === 'Pending' ? (
                      <>
                        <button style={styles.approveBtn} onClick={() => handleAction(leave.id, 'Approved')}>Approve</button>
                        <button style={styles.rejectBtn} onClick={() => handleAction(leave.id, 'Rejected')}>Reject</button>
                      </>
                    ) : (
                      <span style={getStatusBadgeStyle(leave.status)}>
                        {leave.status}
                      </span>
                    )}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#666', padding: '32px' }}>
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveApproval;