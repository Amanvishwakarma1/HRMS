import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeService } from '../services/employeeService';

const EditEmployee = () => {
  const navigate = useNavigate();
  // Extract the specific employee ID from the URL (e.g., /employees/edit/EMP-001)
  const { id } = useParams(); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    joinDate: '',
    status: '' // Added status so we can deactivate employees!
  });

  // Reusable inline styles matching your Add form
  const styles = {
    card: { padding: '24px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' },
    input: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
    buttonPrimary: { width: '100%', padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    buttonSecondary: { width: '100%', padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
  };

  // Fetch the employee data as soon as the page loads
  useEffect(() => {
    const fetchEmployee = async () => {
      const response = await employeeService.getEmployeeById(id);
      if (response.success) {
        setFormData(response.data);
      } else {
        setError(response.message);
      }
      setIsLoading(false);
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Call the update service
    const response = await employeeService.updateEmployee(id, formData);
    
    if (response.success) {
      alert(response.message);
      navigate('/employees'); // Go back to the list
    } else {
      alert(response.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p style={{ textAlign: 'center', color: '#666' }}>Loading employee data...</p>;
  if (error) return <p style={{ textAlign: 'center', color: '#dc2626', fontWeight: 'bold' }}>{error}</p>;

  return (
    <div style={styles.card}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Edit Employee Profile</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Updating details for ID: <strong>{id}</strong></p>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email Address</label>
          <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Department</label>
            <select style={styles.input} name="department" value={formData.department} onChange={handleChange} required>
              <option value="Engineering">Engineering</option>
              <option value="HR">Human Resources</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Designation</label>
            <input style={styles.input} type="text" name="designation" value={formData.designation} onChange={handleChange} required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
             <label style={styles.label}>Joining Date</label>
             <input style={styles.input} type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
             <label style={styles.label}>Status</label>
             <select style={styles.input} name="status" value={formData.status} onChange={handleChange} required>
               <option value="Active">Active</option>
               <option value="On Leave">On Leave</option>
               <option value="Inactive">Inactive (Terminated/Resigned)</option>
             </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button style={styles.buttonSecondary} type="button" onClick={() => navigate('/employees')} disabled={isSubmitting}>
            Cancel
          </button>
          <button style={styles.buttonPrimary} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Update Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;