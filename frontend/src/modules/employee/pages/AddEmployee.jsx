import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    joinDate: ''
  });

  const styles = {
    card: { padding: '24px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' },
    input: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setIsSubmitting(true);
    
    // Call our mock service
    const response = await employeeService.addEmployee(formData);
    
    if (response.success) {
      alert(response.message);
      setIsSubmitting(false);
      navigate('/employees'); // Redirect back to the list after saving
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Add New Employee</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email Address</label>
          <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@company.com" />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Department</label>
            <select style={styles.input} name="department" value={formData.department} onChange={handleChange} required>
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">Human Resources</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Designation</label>
            <input style={styles.input} type="text" name="designation" value={formData.designation} onChange={handleChange} required placeholder="e.g. Software Engineer" />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Joining Date</label>
          <input style={styles.input} type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} required />
        </div>

        <button style={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving Employee...' : 'Save Employee'}
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;