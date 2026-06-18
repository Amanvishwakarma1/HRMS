import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

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
