import axios from 'axios';

const GEOFENCE_CONFIG_KEY = 'attendance_geofence_config';

const defaultGeofence = {
  lat: 28.6282, 
  lng: 77.3898,
  radius: 200, 
  officeName: 'Headquarters Alpha'
};

export const geofenceService = {
  fetchOfficeLocation: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/geofence');
      if (res.data) {
        return {
          officeName: res.data.officeName || res.data.office_name,
          lat: parseFloat(res.data.latitude),
          lng: parseFloat(res.data.longitude),
          radius: parseInt(res.data.radiusMeters || res.data.radius_meters || 200)
        };
      }
    } catch (err) {
      console.error("API error fetching office geofence:", err);
    }
    const cached = localStorage.getItem(GEOFENCE_CONFIG_KEY);
    return cached ? JSON.parse(cached) : defaultGeofence;
  },

  updateGeofenceSettings: async (newConfig) => {
    try {
      const payload = {
        officeName: newConfig.officeName,
        latitude: newConfig.lat,
        longitude: newConfig.lng,
        radiusMeters: newConfig.radius
      };
      const res = await axios.post('http://localhost:5000/api/geofence/update', payload);
      if (res.data) {
        const mapped = {
          officeName: res.data.officeName || res.data.office_name,
          lat: parseFloat(res.data.latitude),
          lng: parseFloat(res.data.longitude),
          radius: parseInt(res.data.radiusMeters || res.data.radius_meters)
        };
        localStorage.setItem(GEOFENCE_CONFIG_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.error("API error updating office geofence:", err);
    }
    localStorage.setItem(GEOFENCE_CONFIG_KEY, JSON.stringify(newConfig));
    return newConfig;
  },

  validateGeofence: (userLocation, officeLocation, radiusMeters) => {
    if (!userLocation || !officeLocation) return false;
    const R = 6371000; // meters
    const dLat = (userLocation.lat - officeLocation.lat) * Math.PI / 180;
    const dLng = (userLocation.lng - officeLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(officeLocation.lat * Math.PI / 180) * Math.cos(userLocation.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= (radiusMeters || officeLocation.radius || 200);
  }
};