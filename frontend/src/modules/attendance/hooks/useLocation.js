import { useState, useEffect, useCallback, useRef } from 'react';
import { locationService } from '../services/locationService';

export const useLocation = (autoWatch = false) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const fetchCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
      return loc;
    } catch (err) {
      setError(err.message || 'Error occurred querying GPS subsystem.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoWatch) {
      setLoading(true);
      watchIdRef.current = locationService.watchPosition(
        (loc) => {
          setLocation(loc);
          setLoading(false);
          setError(null);
        },
        (err) => {
          setError(err.message || 'Streaming tracking link dropped.');
          setLoading(false);
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        locationService.clearWatch(watchIdRef.current);
      }
    };
  }, [autoWatch]);

  return { location, loading, error, fetchCurrentLocation };
};