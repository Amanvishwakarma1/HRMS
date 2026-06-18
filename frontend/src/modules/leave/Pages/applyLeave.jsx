import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService } from '../services/leaveService';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const styles = {
    card: { padding: '24px', maxWidth: '600px', margin: '0 auto', borderRadius: '16px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' },
    input: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' },
    textarea: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', minHeight: '100px', fontFamily: 'inherit' },
    button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s' }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const response = await leaveService.applyLeave(formData);
    
    if (response.success) {
      alert(response.message);
      // Route them to the history tab to see their new pending request
      navigate('/leave/history'); 
    }
    setIsSubmitting(false);
  };

  return (
    <div className="premium-card-bg" style={styles.card}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Apply for Leave</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Submit a new time-off request for manager approval.</p>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Leave Type</label>
          <select style={styles.input} name="type" value={formData.type} onChange={handleChange} required>
            <option value="">Select Leave Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Earned Leave">Earned Leave</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
             <label style={styles.label}>Start Date</label>
             <input style={styles.input} type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
             <label style={styles.label}>End Date</label>
             <input style={styles.input} type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Reason for Leave</label>
          <textarea 
            style={styles.textarea} 
            name="reason" 
            value={formData.reason} 
            onChange={handleChange} 
            required 
            placeholder="Please briefly explain the reason for your request..."
          />
        </div>

        <button 
          style={styles.button} 
          type="submit" 
          disabled={isSubmitting}
          onMouseOver={(e) => !isSubmitting && (e.target.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => !isSubmitting && (e.target.style.backgroundColor = '#007bff')}
        >
          {isSubmitting ? 'Submitting Request...' : 'Submit Leave Request'}
        </button>
      </form>
    </div>
  );
};

export default ApplyLeave;