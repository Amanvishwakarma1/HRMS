import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyles = () => {
    let bg = '#10b981';
    let icon = <CheckCircle2 size={18} color="#fff" />;
    
    if (type === 'error') {
      bg = '#ef4444';
      icon = <AlertCircle size={18} color="#fff" />;
    } else if (type === 'info') {
      bg = '#0ea5e9';
      icon = <Info size={18} color="#fff" />;
    }

    return { bg, icon };
  };

  const { bg, icon } = getStyles();

  const toastStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: bg,
    color: '#ffffff',
    padding: '14px 20px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1000,
    fontSize: '14px',
    fontWeight: '600',
    animation: 'slideIn 0.3s ease-out'
  };

  return (
    <div style={toastStyle}>
      {icon}
      <span>{message}</span>
      <button 
        onClick={onClose} 
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.8 }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
