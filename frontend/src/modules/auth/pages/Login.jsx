import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const styles = {
    wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
    card: { width: '100%', maxWidth: '400px', backgroundColor: '#fff', padding: '40px 32px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    title: { margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
    subtitle: { margin: '0 0 32px 0', fontSize: '15px', color: '#64748b', textAlign: 'center' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' },
    input: { width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '15px', outline: 'none' },
    button: { width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px', transition: 'background-color 0.2s' },
    error: { color: '#b91c1c', fontSize: '14px', marginBottom: '20px', textAlign: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '10px', borderRadius: '6px' },
    hint: { marginTop: '32px', fontSize: '13px', color: '#64748b', textAlign: 'center', lineHeight: '1.6', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px' }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const res = await authService.login(credentials.username, credentials.password);
    if (res.success) {
      // Save user session
      localStorage.setItem('currentUser', JSON.stringify({ 
        username: res.username, 
        role: res.role, 
        token: res.token, 
        id: res.id 
      }));
      
      // Auto-configure active employee ID context for tracking
      const activeId = res.id ? String(res.id) : '4';
      localStorage.setItem('active_employee_id', activeId);

      navigate('/'); // Route to dashboard
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>HRMS Portal</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} type="text" name="username" value={credentials.username} onChange={handleChange} required placeholder="admin, hr, manager, employee" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password" value={credentials.password} onChange={handleChange} required placeholder="password123" />
          </div>
          <button 
            style={styles.button} 
            type="submit"
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Sign In
          </button>
        </form>

        <div style={styles.hint}>
          <strong>Test Credentials:</strong><br />
          Usernames: <em>admin, hr, manager, employee</em><br />
          Password: <em>password123</em>
        </div>
      </div>
    </div>
  );
};

export default Login;