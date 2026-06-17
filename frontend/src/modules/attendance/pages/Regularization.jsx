import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { PenTool, Check, X, ClipboardList, Send, FileEdit, AlertCircle } from 'lucide-react';

const Regularization = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
    requestedCheckIn: '09:00 AM',
    requestedCheckOut: '06:30 PM'
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Get current user details
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'Employee', role: 'employee' };
  const isApprover = ['admin', 'hr', 'manager'].includes(currentUser.role);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    const res = await attendanceService.getRegularizations();
    if (res.success) {
      setRequests(res.data);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.reason) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }

    const res = await attendanceService.submitRegularization(formData);
    if (res.success) {
      setMessage({ text: 'Regularization request submitted successfully!', type: 'success' });
      setFormData({
        date: '',
        reason: '',
        requestedCheckIn: '09:00 AM',
        requestedCheckOut: '06:30 PM'
      });
      fetchRequests();
    } else {
      setMessage({ text: res.message || 'Submission failed.', type: 'error' });
    }

    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleStatusUpdate = async (id, status) => {
    const res = await attendanceService.updateRegularizationStatus(id, status);
    if (res.success) {
      setMessage({ text: `Request ${status.toLowerCase()} successfully!`, type: 'success' });
      fetchRequests();
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: isApprover ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#475569'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      boxSizing: 'border-box',
      fontSize: '14px',
      outline: 'none'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      boxSizing: 'border-box',
      fontSize: '14px',
      height: '80px',
      outline: 'none',
      resize: 'none'
    },
    button: {
      padding: '12px 20px',
      backgroundColor: '#0ea5e9',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s'
    },
    badge: (status) => {
      let bg = '#f1f5f9';
      let color = '#475569';
      if (status === 'Approved') { bg = '#d1fae5'; color = '#065f46'; }
      else if (status === 'Pending') { bg = '#fef3c7'; color = '#92400e'; }
      else if (status === 'Rejected') { bg = '#fee2e2'; color = '#991b1b'; }
      return {
        padding: '4px 8px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 'bold',
        backgroundColor: bg,
        color: color
      };
    },
    reqItem: {
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#fff'
    },
    actionBtn: (type) => ({
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: type === 'approve' ? '#22c55e' : '#ef4444'
    }),
    alert: (type) => ({
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '20px',
      backgroundColor: type === 'success' ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`,
      color: type === 'success' ? '#166534' : '#991b1b'
    })
  };

  return (
    <div>
      {message.text && (
        <div style={styles.alert(message.type)}>
          {message.text}
        </div>
      )}

      {/* Approver View: Manager/HR Dashboard */}
      {isApprover && (
        <div style={{ ...styles.card, marginBottom: '32px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={20} color="#0ea5e9" />
            Attendance Regularization Approvals Center
          </h3>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '-12px', marginBottom: '20px' }}>
            As a <strong>{currentUser.role.toUpperCase()}</strong>, you can review and approve employee attendance correction requests.
          </p>

          {isLoading ? (
            <p>Loading requests...</p>
          ) : requests.filter(r => r.status === 'Pending').length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
              <Check size={28} style={{ color: '#22c55e', margin: '0 auto 8px auto', display: 'block' }} />
              No pending regularization requests.
            </div>
          ) : (
            <div>
              {requests.filter(r => r.status === 'Pending').map((req) => (
                <div key={req.id} style={{ ...styles.reqItem, backgroundColor: '#f8fafc', borderLeft: '4px solid #eab308' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '15px' }}>{req.employeeName}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Applied On: {req.appliedOn}</div>
                    </div>
                    <span style={styles.badge(req.status)}>{req.status}</span>
                  </div>

                  <div style={{ fontSize: '13px', margin: '12px 0', color: '#334155' }}>
                    <div>Date to Regularize: <strong>{req.date}</strong></div>
                    <div style={{ marginTop: '4px' }}>Requested Punch: <strong>{req.requestedCheckIn}</strong> to <strong>{req.requestedCheckOut}</strong></div>
                    <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#475569' }}>Reason: "{req.reason}"</div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button style={styles.actionBtn('approve')} onClick={() => handleStatusUpdate(req.id, 'Approved')}>
                      <Check size={14} /> Approve
                    </button>
                    <button style={styles.actionBtn('reject')} onClick={() => handleStatusUpdate(req.id, 'Rejected')}>
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Standard Form and Employee List View */}
      <div style={styles.grid}>
        {/* Left Side: Submit Request (Only for standard employees, or shown as option) */}
        {!isApprover && (
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileEdit size={20} color="#0ea5e9" />
              Apply Regularization
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Date</label>
                <input 
                  type="date" 
                  name="date" 
                  style={styles.input} 
                  value={formData.date} 
                  onChange={handleInputChange} 
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.label}>Requested Check-In</label>
                  <input 
                    type="text" 
                    name="requestedCheckIn" 
                    placeholder="09:00 AM" 
                    style={styles.input} 
                    value={formData.requestedCheckIn} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>Requested Check-Out</label>
                  <input 
                    type="text" 
                    name="requestedCheckOut" 
                    placeholder="06:30 PM" 
                    style={styles.input} 
                    value={formData.requestedCheckOut} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Reason for Adjustment</label>
                <textarea 
                  name="reason" 
                  placeholder="E.g., Forgot to checkout due to late deployment, system sync failure" 
                  style={styles.textarea} 
                  value={formData.reason} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button 
                type="submit" 
                style={styles.button}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
              >
                <Send size={16} /> Submit Request
              </button>
            </form>
          </div>
        )}

        {/* Right Side / Bottom: My Requests List */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={20} color="#0ea5e9" />
            {isApprover ? 'All Historical Requests Log' : 'My Requests'}
          </h3>

          {isLoading ? (
            <p>Loading history...</p>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
              <AlertCircle size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
              No regularization requests logged yet.
            </div>
          ) : (
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {requests.map((req) => (
                <div key={req.id} style={styles.reqItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Request ID: {req.id}</span>
                    <span style={styles.badge(req.status)}>{req.status}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: '8px 0 4px 0' }}>
                    {req.date}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Punches: {req.requestedCheckIn} - {req.requestedCheckOut}
                  </div>
                  {isApprover && (
                    <div style={{ fontSize: '12px', color: '#0ea5e9', marginTop: '4px' }}>
                      Employee: {req.employeeName}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', fontStyle: 'italic' }}>
                    "{req.reason}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Regularization;
