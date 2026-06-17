export const locationService = {
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation framework unsupported by browser architecture.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          let message = 'Failed to fetch hardware location matrix.';
          if (error.code === 1) message = 'Location privileges denied by worker browser context.';
          if (error.code === 2) message = 'Internal network position unavailable.';
          if (error.code === 3) message = 'Hardware positioning query timeout reached.';
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  watchPosition: (onSuccess, onError) => {
    if (!navigator.geolocation) {
      onError(new Error('Geolocation framework unsupported.'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        onError(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  },

  clearWatch: (watchId) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
};