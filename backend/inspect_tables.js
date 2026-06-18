import { sequelize } from './config/db.js';

async function run() {
  try {
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public';",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log("Tables in database:", tables);
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}
run();
