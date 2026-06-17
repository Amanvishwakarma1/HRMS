import { sequelize } from './config/db.js';

async function fixRadius() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");
    
    // Check current geofence
    const current = await sequelize.query(
      'SELECT * FROM locations ORDER BY id ASC LIMIT 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (current.length > 0) {
      console.log(`Current: ${current[0].office_name} — Lat: ${current[0].latitude}, Lng: ${current[0].longitude}, Radius: ${current[0].radius_meters}m`);
    }
    
    // Update radius to 300m
    await sequelize.query(
      `UPDATE locations SET radius_meters = 300 WHERE id = :id`,
      { replacements: { id: current[0].id } }
    );
    
    // Verify
    const updated = await sequelize.query(
      'SELECT * FROM locations ORDER BY id ASC LIMIT 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(`\n✅ Updated: ${updated[0].office_name} — Radius: ${updated[0].radius_meters}m`);
    console.log(`   Lat: ${updated[0].latitude}, Lng: ${updated[0].longitude}`);
    
    console.log("\nWith 300m radius:");
    console.log("  🟢 Employee 1 (~100m away) → INSIDE");
    console.log("  🟢 Employee 2 (~160m away) → INSIDE");
    console.log("  🔴 Employee 3 (~630m away) → OUTSIDE");
    console.log("  🔴 Employee 4 (~870m away) → OUTSIDE");
    console.log("  🔴 Employee 5 (~1.2km away) → OUTSIDE");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sequelize.close();
  }
}

fixRadius();
