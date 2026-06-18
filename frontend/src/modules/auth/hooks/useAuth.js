import { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

/**
 * Simple authentication hook that reads the JWT token stored in localStorage
 * (or sessionStorage) and decodes it to expose the user payload.
 * The payload is expected to contain `employeeId` (or `id`) and `role`.
 */
function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setUser({ token, ...decoded });
      } catch (e) {
        console.error('Failed to decode JWT token', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  return user;
}

export default useAuth;