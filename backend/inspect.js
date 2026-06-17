import { sequelize } from './config/db.js';

async function inspect() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connection successful! Querying tables...");

    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public';",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log("Tables in database:", tables);

    for (const t of tables) {
      const name = t.table_name;
      const columns = await sequelize.query(
        `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${name}';`,
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log(`Columns in table "${name}":`, columns.map(c => `${c.column_name} (${c.data_type})`));
    }

    const employees = await sequelize.query("SELECT * FROM employees LIMIT 5;", { type: sequelize.QueryTypes.SELECT });
    console.log("Employees sample:", employees);

    const locations = await sequelize.query("SELECT * FROM locations LIMIT 5;", { type: sequelize.QueryTypes.SELECT });
    console.log("Locations sample:", locations);

    const attendance = await sequelize.query("SELECT * FROM attendance LIMIT 5;", { type: sequelize.QueryTypes.SELECT });
    console.log("Attendance sample:", attendance);

  } catch (err) {
    console.error("Error inspecting database:", err);
  } finally {
    await sequelize.close();
  }
}

inspect();
