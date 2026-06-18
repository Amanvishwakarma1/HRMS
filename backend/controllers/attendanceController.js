import { calculateDistance } from '../utiles/haversine.js';
import { sequelize } from '../config/db.js';

export const checkIn = async (req, res) => {
  try {
    const { employeeId, latitude, longitude } = req.body;
    
    console.log(`📥 Direct Matrix Packet Received -> ID: ${employeeId} | Lat: ${latitude}, Lng: ${longitude}`);

    if (!employeeId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: "Telemetry Fault: Missing required inputs." });
    }

    const numericEmployeeId = Number(employeeId); 
    const userLat = parseFloat(latitude);
    const userLong = parseFloat(longitude);

    // 1. Verify employee exists
    const employeeResult = await sequelize.query(
      'SELECT id, name FROM employees WHERE id = :targetId LIMIT 1',
      { replacements: { targetId: numericEmployeeId }, type: sequelize.QueryTypes.SELECT }
    );

    if (!employeeResult || employeeResult.length === 0) {
      return res.status(404).json({ success: false, message: `Employee with ID ${numericEmployeeId} not found.` });
    }
    const employee = employeeResult[0];

    // 2. Check if already checked in
    const activeRecord = await sequelize.query(
      'SELECT * FROM attendance WHERE employee_id = :empId AND check_out_time IS NULL LIMIT 1',
      { replacements: { empId: numericEmployeeId }, type: sequelize.QueryTypes.SELECT }
    );
    if (activeRecord && activeRecord.length > 0) {
      return res.status(400).json({ success: false, message: `${employee.name} is already checked in. Please check out first.` });
    }

    // 3. Fetch geofence configuration from locations
    let locName = "Headquarters Alpha";
    let officeLat = 28.6282; 
    let officeLong = 77.3898;
    let allowedRadius = 200;

    try {
      const dynamicLocations = await sequelize.query(
        'SELECT * FROM locations LIMIT 1',
        { type: sequelize.QueryTypes.SELECT }
      );
      if (dynamicLocations && dynamicLocations.length > 0) {
        locName = dynamicLocations[0].office_name || "Headquarters Alpha";
        officeLat = parseFloat(dynamicLocations[0].latitude);
        officeLong = parseFloat(dynamicLocations[0].longitude);
        allowedRadius = Number(dynamicLocations[0].radius_meters || 200);
      }
    } catch (e) {
      console.log("⚠️ Error fetching locations:", e.message);
    }

    const distance = calculateDistance(userLat, userLong, officeLat, officeLong);

    if (distance > allowedRadius) {
      return res.status(403).json({
        success: false,
        message: `Outside geofence enclosure bounds. You are ${Math.round(distance)} meters away from ${locName}. (Configured Radius: ${allowedRadius}m)`,
        inOffice: false
      });
    }

    // Determine status: Late if after 9:15 AM
    const now = new Date();
    const cutoffTime = new Date(now);
    cutoffTime.setHours(9, 15, 0, 0);
    const status = now > cutoffTime ? 'Late' : 'Present';

    // 4. Save check-in
    await sequelize.query(
      `INSERT INTO attendance (employee_id, status, latitude, longitude, geofence_verified, check_in_time) 
       VALUES (:empId, :status, :lat, :lng, true, NOW())`,
      { replacements: { empId: numericEmployeeId, status, lat: userLat, lng: userLong } }
    );

    return res.status(201).json({
      success: true,
      message: `Welcome ${employee.name}! Attendance verified present at ${locName}.`,
      inOffice: true
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: `Fatal: ${error.message}` });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { employeeId, latitude, longitude, accumulatedOutsideMinutes, bypassShiftCheck } = req.body;
    
    if (!employeeId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: "Missing required check-out telemetry details." });
    }

    const numericEmployeeId = Number(employeeId);
    const userLat = parseFloat(latitude);
    const userLong = parseFloat(longitude);

    // 1. Fetch geofence configuration
    let officeLat = 28.6282; 
    let officeLong = 77.3898;
    let allowedRadius = 200;

    try {
      const dynamicLocations = await sequelize.query(
        'SELECT * FROM locations LIMIT 1',
        { type: sequelize.QueryTypes.SELECT }
      );
      if (dynamicLocations && dynamicLocations.length > 0) {
        officeLat = parseFloat(dynamicLocations[0].latitude);
        officeLong = parseFloat(dynamicLocations[0].longitude);
        allowedRadius = Number(dynamicLocations[0].radius_meters || 200);
      }
    } catch (e) {
      console.log("⚠️ Error fetching locations:", e.message);
    }

    const distance = calculateDistance(userLat, userLong, officeLat, officeLong);

    // Strict boundary perimeter check (using allowedRadius instead of hardcoded 100m)
    if (distance > allowedRadius) {
      return res.status(403).json({
        success: false,
        message: `Check-out rejected. You are outside the office area (${Math.round(distance)} meters away). You must be under ${allowedRadius}m from office zone.`
      });
    }

    // 2. Fetch the active check-in record
    const lastRecord = await sequelize.query(
      `SELECT * FROM attendance WHERE employee_id = :empId AND check_out_time IS NULL ORDER BY check_in_time DESC LIMIT 1`,
      { replacements: { empId: numericEmployeeId }, type: sequelize.QueryTypes.SELECT }
    );

    if (!lastRecord || lastRecord.length === 0) {
      return res.status(404).json({ success: false, message: "No active check-in record found for this employee." });
    }

    const checkInRecord = lastRecord[0];
    const checkInTime = new Date(checkInRecord.check_in_time);
    const now = new Date();
    const hoursWorked = (now - checkInTime) / (1000 * 60 * 60);

    // 3. Enforce 8-hour shift completion (bypassable in testing)
    if (hoursWorked < 8 && !bypassShiftCheck) {
      const minsLeft = Math.ceil((8 - hoursWorked) * 60);
      return res.status(400).json({
        success: false,
        message: `Early check-out blocked. Shift incomplete. You need to work ${minsLeft} more minutes to complete your 8-hour shift.`,
        canBypass: true
      });
    }

    // Determine status (if hours worked < 4, mark Late/Absent, otherwise keep Present/Late)
    let finalStatus = checkInRecord.status;
    if (hoursWorked < 4) {
      finalStatus = 'Absent'; // Worked less than 4 hours
    }

    // 4. Update check-out log in Postgres
    await sequelize.query(
      `UPDATE attendance 
       SET check_out_time = NOW(), total_hours = :totalHours, status = :status, latitude = :lat, longitude = :lng
       WHERE id = :id`,
      {
        replacements: {
          totalHours: parseFloat(hoursWorked.toFixed(2)),
          status: finalStatus,
          lat: userLat,
          lng: userLong,
          id: checkInRecord.id
        }
      }
    );

    return res.status(200).json({ 
      success: true, 
      message: `Checked out successfully. Shift effort: ${hoursWorked.toFixed(2)} hours. Status: ${finalStatus}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLiveTracking = async (req, res) => {
  try {
    const role = req.user?.role?.toLowerCase();
    const loggedInEmployeeId = req.user?.id ? Number(req.user.id) : null;

    let dynamicQuery;
    let replacements = {};

    if (role === 'employee' && loggedInEmployeeId) {
      dynamicQuery = `
        SELECT DISTINCT ON (a.employee_id) 
          e.id,
          e.name,
          e.role,
          a.latitude, 
          a.longitude, 
          a.status,
          a.geofence_verified,
          a.check_in_time
        FROM employees e
        INNER JOIN attendance a ON e.id = a.employee_id
        WHERE e.id = :empId
        ORDER BY a.employee_id, a.check_in_time DESC;
      `;
      replacements = { empId: loggedInEmployeeId };
    } else {
      dynamicQuery = `
        SELECT DISTINCT ON (a.employee_id) 
          e.id,
          e.name,
          e.role,
          a.latitude, 
          a.longitude, 
          a.status,
          a.geofence_verified,
          a.check_in_time
        FROM employees e
        INNER JOIN attendance a ON e.id = a.employee_id
        ORDER BY a.employee_id, a.check_in_time DESC;
      `;
    }
    
    const dbRecords = await sequelize.query(dynamicQuery, { 
      replacements,
      type: sequelize.QueryTypes.SELECT 
    });
    return res.status(200).json({ success: true, data: dbRecords });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const history = await sequelize.query(
      `SELECT * FROM attendance WHERE employee_id = :employeeId ORDER BY check_in_time DESC`,
      { replacements: { employeeId: Number(employeeId) }, type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const allRecords = await sequelize.query(
      `SELECT a.*, e.name as employee_name, e.role as employee_role 
       FROM attendance a
       INNER JOIN employees e ON a.employee_id = e.id
       ORDER BY a.check_in_time DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json({ success: true, data: allRecords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const list = await sequelize.query(
      `SELECT id, name, email, role FROM employees ORDER BY id ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};