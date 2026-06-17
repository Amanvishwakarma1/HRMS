import { calculateDistance } from './calculateDistance';

/**
 * Validates whether an active user location sits within the required perimeter radius
 * @param {Object} userLocation - { lat, lng }
 * @param {Object} officeLocation - { lat, lng }
 * @param {number} [radiusMeters=200] - Acceptable threshold boundary
 * @returns {boolean} Within boundary state
 */
export const isWithinGeofence = (userLocation, officeLocation, radiusMeters = 200) => {
  if (!userLocation || !officeLocation) return false;
  
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    officeLocation.lat,
    officeLocation.lng
  );
  
  return distance <= radiusMeters;
};