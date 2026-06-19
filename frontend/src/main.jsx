import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

// Expose a beautiful global toast alert system
window.showToast = (message, type = 'success') => {
  const containerId = 'chronos-toast-container';
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '99999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.style.padding = '14px 20px';
  toast.style.borderRadius = '12px';
  toast.style.fontFamily = 'Inter, system-ui, sans-serif';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '600';
  toast.style.color = '#ffffff';
  toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Colors based on type
  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  } else if (type === 'warning') {
    toast.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
  } else {
    toast.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  }
  
  // Icon
  const icon = document.createElement('span');
  icon.innerHTML = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
  toast.appendChild(icon);
  
  // Message text
  const text = document.createElement('span');
  text.innerText = message;
  toast.appendChild(text);
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
};

// Override standard window.alert with our premium toast
window.alert = (message) => {
  if (!message) return;
  const isError = message.toLowerCase().includes('fail') || 
                  message.toLowerCase().includes('error') || 
                  message.toLowerCase().includes('reject') || 
                  message.toLowerCase().includes('invalid') || 
                  message.toLowerCase().includes('blocked') || 
                  message.toLowerCase().includes('denied');
  const type = isError ? 'error' : 'success';
  window.showToast(message, type);
};

// Set up global Axios interceptors for backend communication and JWT injection
axios.defaults.baseURL = import.meta.env.VITE_ENVIRONMENT === 'production' ? '' : 'http://localhost:5000';

axios.interceptors.request.use(
  (config) => {
    // If request target is a full URL, don't override the base
    if (config.url && (config.url.startsWith('http://') || config.url.startsWith('https://'))) {
      // Keep as is
    } else {
      // Handled by baseURL automatically, but let's make sure it doesn't duplicate
    }
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user && user.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error("Failed to parse currentUser for JWT authorization:", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
