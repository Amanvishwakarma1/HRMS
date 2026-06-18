export const locationService = {
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      const simulated = localStorage.getItem('hrms_simulated_gps_coords');
      if (simulated) {
        try {
          const parsed = JSON.parse(simulated);
          if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
            resolve({
              lat: parsed.lat,
              lng: parsed.lng,
              accuracy: 10,
              timestamp: Date.now()
            });
            return;
          }
        } catch (e) {
          console.error("Failed to parse simulated GPS coords:", e);
        }
      }

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
    const simulated = localStorage.getItem('hrms_simulated_gps_coords');
    if (simulated) {
      try {
        const parsed = JSON.parse(simulated);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          // Immediately notify once
          onSuccess({
            lat: parsed.lat,
            lng: parsed.lng,
            accuracy: 10,
            timestamp: Date.now()
          });

          // Watch updates in localStorage
          const intervalId = setInterval(() => {
            const freshSimulated = localStorage.getItem('hrms_simulated_gps_coords');
            if (freshSimulated) {
              try {
                const freshParsed = JSON.parse(freshSimulated);
                onSuccess({
                  lat: freshParsed.lat,
                  lng: freshParsed.lng,
                  accuracy: 10,
                  timestamp: Date.now()
                });
              } catch (e) {
                console.error("Failed to parse simulated GPS coords:", e);
              }
            }
          }, 1000);

          return { type: 'simulated', id: intervalId };
        }
      } catch (e) {
        console.error("Failed to parse simulated GPS coords:", e);
      }
    }

    if (!navigator.geolocation) {
      onError(new Error('Geolocation framework unsupported.'));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
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

    return { type: 'real', id: watchId };
  },

  clearWatch: (watchObj) => {
    if (!watchObj) return;
    if (watchObj.type === 'simulated') {
      clearInterval(watchObj.id);
    } else if (watchObj.type === 'real') {
      navigator.geolocation.clearWatch(watchObj.id);
    } else {
      navigator.geolocation.clearWatch(watchObj);
    }
  }
};