import { sequelize } from './config/db.js';

/**
 * Test Scenario Script
 * --------------------
 * Sets up a realistic test scenario:
 * - 2 employees INSIDE the geofence (within 300m of office)
 * - 3 employees OUTSIDE the geofence (beyond 300m of office)
 * 
 * This allows verification of:
 *   ✅ Live Tracking map pins (green inside, red outside)
 *   ✅ Geofence boundary visualization
 *   ✅ History table with mixed statuses
 *   ✅ Calendar matrix with real data
 *   ✅ Check-in/Check-out flow
 */

async function setupTestScenario() {
  try {
    console.log("🔌 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Connected!\n");

    // 1. Read current geofence config
    const geofence = await sequelize.query(
      'SELECT * FROM locations ORDER BY id ASC LIMIT 1',
      { type: sequelize.QueryTypes.SELECT }
    );

    let officeLat, officeLng, radius, officeName;
    if (geofence && geofence.length > 0) {
      officeLat = parseFloat(geofence[0].latitude);
      officeLng = parseFloat(geofence[0].longitude);
      radius = parseInt(geofence[0].radius_meters);
      officeName = geofence[0].office_name;
    } else {
      officeLat = 28.5759;
      officeLng = 77.3345;
      radius = 300;
      officeName = 'HQ - Noida';
    }

    console.log(`📍 Office Geofence: ${officeName}`);
    console.log(`   Lat: ${officeLat}, Lng: ${officeLng}, Radius: ${radius}m\n`);

    // 2. Verify we have 5 employees
    const employees = await sequelize.query(
      'SELECT id, name, role FROM employees ORDER BY id ASC',
      { type: sequelize.QueryTypes.SELECT }
    );

    if (employees.length < 5) {
      console.log("⚠️  Less than 5 employees found. Re-seeding employees...");
      const empData = [
        { id: 1, name: 'Arjun Verma', email: 'arjun@chronos.com', role: 'Admin', password: 'hashedpassword123' },
        { id: 2, name: 'Priya Sharma', email: 'priya@chronos.com', role: 'Developer', password: 'hashedpassword123' },
        { id: 3, name: 'Rahul Gupta', email: 'rahul@chronos.com', role: 'Manager', password: 'hashedpassword123' },
        { id: 4, name: 'Sneha Patel', email: 'sneha@chronos.com', role: 'QA Engineer', password: 'hashedpassword123' },
        { id: 5, name: 'Vikram Singh', email: 'vikram@chronos.com', role: 'HR Manager', password: 'hashedpassword123' }
      ];
      await sequelize.query('DELETE FROM attendance');
      await sequelize.query('DELETE FROM employees');
      for (const emp of empData) {
        await sequelize.query(
          `INSERT INTO employees (id, name, email, role, password) VALUES (:id, :name, :email, :role, :password)`,
          { replacements: emp }
        );
      }
      // Refresh employee list
      employees.length = 0;
      const refreshed = await sequelize.query('SELECT id, name, role FROM employees ORDER BY id ASC', { type: sequelize.QueryTypes.SELECT });
      refreshed.forEach(e => employees.push(e));
    }

    console.log("👥 Employees:");
    employees.forEach(e => console.log(`   [${e.id}] ${e.name} (${e.role})`));
    console.log("");

    // 3. Clear all existing attendance records
    console.log("🧹 Clearing all existing attendance records...");
    await sequelize.query('DELETE FROM attendance');
    
    // Reset the sequence
    await sequelize.query("SELECT setval('attendance_id_seq', 1, false)").catch(() => {});

    // 4. Generate coordinates
    // INSIDE geofence (within 300m / ~0.0027 degrees)
    const insideCoords = [
      { lat: officeLat + 0.0008, lng: officeLng + 0.0005, distance: '~100m NE' },  // ~100m away
      { lat: officeLat - 0.0012, lng: officeLng + 0.0008, distance: '~160m SE' },  // ~160m away
    ];

    // OUTSIDE geofence (beyond 300m)
    const outsideCoords = [
      { lat: officeLat + 0.0045, lng: officeLng + 0.0035, distance: '~630m NE' },   // ~630m away
      { lat: officeLat - 0.0060, lng: officeLng - 0.0050, distance: '~870m SW' },   // ~870m away
      { lat: officeLat + 0.0080, lng: officeLng - 0.0070, distance: '~1.2km NW' },  // ~1.2km away
    ];

    // 5. Insert historical data (past 10 working days) for all employees
    console.log("📅 Inserting 10 days of historical attendance...");
    let attendanceId = 1;
    const today = new Date();
    
    for (let dayOffset = 10; dayOffset >= 1; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      
      const dateStr = d.toISOString().split('T')[0];
      
      for (let empIdx = 0; empIdx < employees.length; empIdx++) {
        const emp = employees[empIdx];
        const isInside = empIdx < 2; // First 2 employees always inside
        const coord = isInside 
          ? insideCoords[empIdx % insideCoords.length]
          : outsideCoords[(empIdx - 2) % outsideCoords.length];
        
        // Randomize check-in time (8:45 - 9:30)
        const isLate = Math.random() < 0.25;
        const checkInHour = isLate ? 9 : 8;
        const checkInMinute = isLate ? (15 + Math.floor(Math.random() * 45)) : (45 + Math.floor(Math.random() * 15));
        
        // Check-out time (17:00 - 18:30)
        const checkOutHour = 17 + Math.floor(Math.random() * 2);
        const checkOutMinute = Math.floor(Math.random() * 30);
        
        const checkInTime = `${dateStr}T${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}:00.000Z`;
        const checkOutTime = `${dateStr}T${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}:00.000Z`;
        const totalHours = parseFloat(((new Date(checkOutTime) - new Date(checkInTime)) / 3600000).toFixed(2));
        
        const status = isLate ? 'Late' : 'Present';
        
        await sequelize.query(
          `INSERT INTO attendance (id, employee_id, check_in_time, check_out_time, total_hours, status, latitude, longitude, geofence_verified)
           VALUES (:id, :empId, :checkIn, :checkOut, :hours, :status, :lat, :lng, :verified)`,
          {
            replacements: {
              id: attendanceId++,
              empId: emp.id,
              checkIn: checkInTime,
              checkOut: checkOutTime,
              hours: totalHours,
              status,
              lat: coord.lat,
              lng: coord.lng,
              verified: isInside
            }
          }
        );
      }
    }
    console.log(`   ✅ Inserted ${attendanceId - 1} historical records\n`);

    // 6. Insert TODAY's active check-ins (no check-out = currently active)
    console.log("🟢 Setting up TODAY's active check-ins...");
    const todayStr = today.toISOString().split('T')[0];

    // Employee 1 (INSIDE) - Checked in at 9:00 AM
    const emp1 = employees[0];
    const coord1 = insideCoords[0];
    await sequelize.query(
      `INSERT INTO attendance (id, employee_id, check_in_time, check_out_time, status, latitude, longitude, geofence_verified)
       VALUES (:id, :empId, :checkIn, NULL, 'Present', :lat, :lng, true)`,
      {
        replacements: {
          id: attendanceId++,
          empId: emp1.id,
          checkIn: `${todayStr}T03:30:00.000Z`, // 9:00 AM IST
          lat: coord1.lat,
          lng: coord1.lng,
        }
      }
    );
    console.log(`   ✅ ${emp1.name} — INSIDE geofence (${coord1.distance}) — Status: Present`);

    // Employee 2 (INSIDE) - Checked in at 9:10 AM
    const emp2 = employees[1];
    const coord2 = insideCoords[1];
    await sequelize.query(
      `INSERT INTO attendance (id, employee_id, check_in_time, check_out_time, status, latitude, longitude, geofence_verified)
       VALUES (:id, :empId, :checkIn, NULL, 'Present', :lat, :lng, true)`,
      {
        replacements: {
          id: attendanceId++,
          empId: emp2.id,
          checkIn: `${todayStr}T03:40:00.000Z`, // 9:10 AM IST
          lat: coord2.lat,
          lng: coord2.lng,
        }
      }
    );
    console.log(`   ✅ ${emp2.name} — INSIDE geofence (${coord2.distance}) — Status: Present`);

    // Employee 3 (OUTSIDE) - Checked in at 9:30 AM
    const emp3 = employees[2];
    const coord3 = outsideCoords[0];
    await sequelize.query(
      `INSERT INTO attendance (id, employee_id, check_in_time, check_out_time, status, latitude, longitude, geofence_verified)
       VALUES (:id, :empId, :checkIn, NULL, 'Late', :lat, :lng, false)`,
      {
        replacements: {
          id: attendanceId++,
          empId: emp3.id,
          checkIn: `${todayStr}T04:00:00.000Z`, // 9:30 AM IST  
          lat: coord3.lat,
          lng: coord3.lng,
        }
      }
    );
    console.log(`   ❌ ${emp3.name} — OUTSIDE geofence (${coord3.distance}) — Status: Late`);

    // Employee 4 (OUTSIDE) - Checked in at 9:45 AM
    const emp4 = employees[3];
    const coord4 = outsideCoords[1];
    await sequelize.query(
      `INSERT INTO attendance (id, employee_id, check_in_time, check_out_time, status, latitude, longitude, geofence_verified)
       VALUES (:id, :empId, :checkIn, NULL, 'Late', :lat, :lng, false)`,
      {
        replacements: {
          id: attendanceId++,
          empId: emp4.id,
          checkIn: `${todayStr}T04:15:00.000Z`, // 9:45 AM IST
          lat: coord4.lat,
          lng: coord4.lng,
        }
      }
    );
    console.log(`   ❌ ${emp4.name} — OUTSIDE geofence (${coord4.distance}) — Status: Late`);

    // Employee 5 (OUTSIDE) - Checked in at 10:00 AM
    const emp5 = employees[4];
    const coord5 = outsideCoords[2];
    await sequelize.query(
      `INSERT INTO attendance (id, employee_id, check_in_time, check_out_time, status, latitude, longitude, geofence_verified)
       VALUES (:id, :empId, :checkIn, NULL, 'Late', :lat, :lng, false)`,
      {
        replacements: {
          id: attendanceId++,
          empId: emp5.id,
          checkIn: `${todayStr}T04:30:00.000Z`, // 10:00 AM IST
          lat: coord5.lat,
          lng: coord5.lng,
        }
      }
    );
    console.log(`   ❌ ${emp5.name} — OUTSIDE geofence (${coord5.distance}) — Status: Late`);

    // Reset sequence to next available id
    await sequelize.query(`SELECT setval('attendance_id_seq', ${attendanceId}, false)`).catch(() => {});

    console.log("\n" + "=".repeat(60));
    console.log("🎯 TEST SCENARIO READY!");
    console.log("=".repeat(60));
    console.log(`\n📍 Geofence: ${officeName} (${officeLat}, ${officeLng}) — ${radius}m radius`);
    console.log("\n🟢 INSIDE geofence (green pins on map):");
    console.log(`   [${emp1.id}] ${emp1.name} — ${coord1.distance} from office`);
    console.log(`   [${emp2.id}] ${emp2.name} — ${coord2.distance} from office`);
    console.log("\n🔴 OUTSIDE geofence (red pins on map):");
    console.log(`   [${emp3.id}] ${emp3.name} — ${coord3.distance} from office`);
    console.log(`   [${emp4.id}] ${emp4.name} — ${coord4.distance} from office`);
    console.log(`   [${emp5.id}] ${emp5.name} — ${coord5.distance} from office`);
    console.log("\n📊 Total records inserted: " + (attendanceId - 1));
    console.log("   Historical: " + (attendanceId - 6) + " | Today (active): 5");
    console.log("\n🌐 Open http://localhost:5173 to verify!\n");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await sequelize.close();
  }
}

setupTestScenario();
