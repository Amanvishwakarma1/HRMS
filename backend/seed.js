import { sequelize } from './config/db.js';

async function seed() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connected successfully!");

    // Clear existing data
    console.log("Clearing existing attendance, employees, and locations records...");
    await sequelize.query("TRUNCATE TABLE attendance, employees, locations CASCADE;");

    // Insert Default Location
    console.log("Inserting default office location...");
    await sequelize.query(`
      INSERT INTO locations (id, office_name, latitude, longitude, radius_meters)
      VALUES (1, 'Headquarters Alpha', 28.6282, 77.3898, 200);
    `);

    // Insert 5 Employees
    console.log("Inserting employees...");
    const employees = [
      { id: 1, name: 'System Administrator', email: 'admin@chronos.com', role: 'Admin', password: 'hashedpassword123' },
      { id: 2, name: 'Core Developer', email: 'dev@chronos.com', role: 'Developer', password: 'hashedpassword123' },
      { id: 3, name: 'Project Manager', email: 'pm@chronos.com', role: 'Manager', password: 'hashedpassword123' },
      { id: 4, name: 'QA Specialist', email: 'qa@chronos.com', role: 'QA Engineer', password: 'hashedpassword123' },
      { id: 5, name: 'HR Executive', email: 'hr@chronos.com', role: 'HR Manager', password: 'hashedpassword123' }
    ];

    for (const emp of employees) {
      await sequelize.query(
        `INSERT INTO employees (id, name, email, role, password) 
         VALUES (:id, :name, :email, :role, :password);`,
        { replacements: emp }
      );
    }

    // Insert historical attendance logs (last 14 days, June 3 to June 16, 2026)
    console.log("Inserting historical attendance records...");
    const statuses = ['Present', 'Late'];
    
    // Office Location is 28.6282, 77.3898.
    // Let's generate slightly varied coordinates within/outside geofence.
    // Inside geofence coords (very close to office)
    const insideCoords = [
      { lat: 28.6283, lng: 77.3899 },
      { lat: 28.6281, lng: 77.3897 },
      { lat: 28.6284, lng: 77.3896 },
      { lat: 28.6280, lng: 77.3900 }
    ];

    let attendanceId = 1;
    for (const emp of employees) {
      // Loop over the last 14 days
      for (let d = 3; d <= 16; d++) {
        // Skip weekends (June 6, 7, 13, 14 are Saturday/Sunday in June 2026)
        // June 3 (Wed), 4 (Thu), 5 (Fri), 8 (Mon), 9 (Tue), 10 (Wed), 11 (Thu), 12 (Fri), 15 (Mon), 16 (Tue)
        if (d === 6 || d === 7 || d === 13 || d === 14) continue;

        const dateStr = `2026-06-${String(d).padStart(2, '0')}`;
        
        // Random check-in status (80% Present, 20% Late)
        const isLate = Math.random() < 0.2;
        const status = isLate ? 'Late' : 'Present';
        
        // Check-in hour (9:00 AM for Present, 9:30-10:15 AM for Late)
        const checkInHour = isLate ? (9 + Math.floor(Math.random() * 2)) : 8;
        const checkInMinute = isLate ? Math.floor(Math.random() * 45) : (45 + Math.floor(Math.random() * 15));
        
        // Check-out hour (5:00 PM to 6:30 PM)
        const checkOutHour = 17 + Math.floor(Math.random() * 2);
        const checkOutMinute = Math.floor(Math.random() * 60);

        const checkInTime = new Date(`${dateStr}T${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}:00.000Z`);
        const checkOutTime = new Date(`${dateStr}T${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}:00.000Z`);
        const totalHours = parseFloat(((checkOutTime - checkInTime) / 3600000).toFixed(2));

        const coord = insideCoords[Math.floor(Math.random() * insideCoords.length)];

        await sequelize.query(
          `INSERT INTO attendance (id, employee_id, check_in_time, check_out_time, total_hours, status, latitude, longitude, geofence_verified)
           VALUES (:id, :employeeId, :checkInTime, :checkOutTime, :totalHours, :status, :latitude, :longitude, :geofenceVerified);`,
          {
            replacements: {
              id: attendanceId++,
              employeeId: emp.id,
              checkInTime,
              checkOutTime,
              totalHours,
              status,
              latitude: coord.lat,
              longitude: coord.lng,
              geofenceVerified: true
            }
          }
        );
      }
    }

    console.log("Fixing database auto-increment sequences...");
    await sequelize.query(`SELECT setval('attendance_id_seq', COALESCE((SELECT MAX(id) FROM attendance), 1))`);
    await sequelize.query(`SELECT setval('employees_id_seq', COALESCE((SELECT MAX(id) FROM employees), 1))`);
    await sequelize.query(`SELECT setval('locations_id_seq', COALESCE((SELECT MAX(id) FROM locations), 1))`);

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await sequelize.close();
  }
}

seed();
