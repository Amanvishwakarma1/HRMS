import { sequelize } from './config/db.js';

async function run() {
  try {
    for (const tableName of ['employees', 'attendance', 'locations']) {
      const columns = await sequelize.query(
        `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${tableName}';`,
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log(`Table "${tableName}" columns:`, columns.map(c => `${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));
    }
  } catch(e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}

run();
