import { sequelize } from './config/db.js';

async function run() {
  try {
    const cols = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees';",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log("Employees columns:", cols);
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}
run();
