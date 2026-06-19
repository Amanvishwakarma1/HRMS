import { Employee } from './models/Employee.js';
import { sequelize } from './config/db.js';

async function query() {
  try {
    await sequelize.authenticate();
    const emps = await Employee.findAll();
    console.log("=== EMPLOYEES IN DATABASE ===");
    emps.forEach(emp => {
      console.log(`ID: ${emp.id}, Name: ${emp.name}, Email: ${emp.email}, Role: ${emp.role}, ManagerId: ${emp.managerId}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

query();
