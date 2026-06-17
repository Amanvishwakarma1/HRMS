import { sequelize } from './config/db.js';

async function updateLocation() {
  try {
    console.log("Fetching current IP geolocation...");
    // Using native global fetch (supported in Node v18+)
    const res = await fetch("http://ip-api.com/json/");
    const data = await res.json();
    
    if (data.status === "success") {
      const lat = parseFloat(data.lat);
      const lon = parseFloat(data.lon);
      const city = data.city;
      const country = data.country;
      
      console.log(`Detected Location: ${city}, ${country} (${lat}, ${lon})`);
      
      console.log("Connecting to database...");
      await sequelize.authenticate();
      
      console.log("Updating geofence coordinates in locations table...");
      // Check if location with ID 1 exists
      const existing = await sequelize.query(
        "SELECT id FROM locations WHERE id = 1",
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (existing && existing.length > 0) {
        await sequelize.query(
          `UPDATE locations 
           SET latitude = :lat, longitude = :lon, radius_meters = 300, office_name = :officeName
           WHERE id = 1`,
          {
            replacements: {
              lat,
              lon,
              officeName: `HQ - ${city}`
            }
          }
        );
      } else {
        await sequelize.query(
          `INSERT INTO locations (id, office_name, latitude, longitude, radius_meters)
           VALUES (1, :officeName, :lat, :lon, 300)`,
          {
            replacements: {
              lat,
              lon,
              officeName: `HQ - ${city}`
            }
          }
        );
      }
      
      console.log(`Success! Geofence updated to ${city} HQ at lat: ${lat}, lng: ${lon} with 300m threshold.`);
    } else {
      console.error("Failed to detect location from IP API:", data.message);
    }
  } catch (err) {
    console.error("Error setting geofence location:", err);
  } finally {
    await sequelize.close();
  }
}

updateLocation();
