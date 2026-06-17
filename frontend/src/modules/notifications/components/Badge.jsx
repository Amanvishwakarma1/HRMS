import React from 'react';

const Badge = ({ count, variant = 'danger', style = {} }) => {
  if (count === undefined || count === null || count === 0) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: '#22c55e', color: '#fff' };
      case 'warning':
        return { backgroundColor: '#eab308', color: '#0f172a' };
      case 'info':
        return { backgroundColor: '#0ea5e9', color: '#fff' };
      case 'danger':
      default:
        return { backgroundColor: '#ef4444', color: '#fff' };
    }
  };

  const baseStyle = {
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '16px',
    height: '18px',
    boxSizing: 'border-box',
    ...getVariantStyles(),
    ...style
  };

  return <span style={baseStyle}>{count}</span>;
};

export default Badge;
