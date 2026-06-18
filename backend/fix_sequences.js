import { sequelize } from './config/db.js';

async function fix() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Fixing sequences...");

    // Reset attendance_id_seq
    const [attSeq] = await sequelize.query(`SELECT setval('attendance_id_seq', COALESCE((SELECT MAX(id) FROM attendance), 1))`);
    console.log("attendance_id_seq reset to:", attSeq);

    // Reset employees_id_seq
    const [empSeq] = await sequelize.query(`SELECT setval('employees_id_seq', COALESCE((SELECT MAX(id) FROM employees), 1))`);
    console.log("employees_id_seq reset to:", empSeq);

    // Reset locations_id_seq
    const [locSeq] = await sequelize.query(`SELECT setval('locations_id_seq', COALESCE((SELECT MAX(id) FROM locations), 1))`);
    console.log("locations_id_seq reset to:", locSeq);

    console.log("Sequences fixed successfully!");
  } catch (err) {
    console.error("Error fixing sequences:", err);
  } finally {
    await sequelize.close();
  }
}

fix();
