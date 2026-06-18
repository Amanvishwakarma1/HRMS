import { sequelize } from './config/db.js';
import { Employee } from './models/Employee.js';
import { SalaryStructure, SalaryStructureHistory } from './models/SalaryStructure.js';
import { PayrollRun } from './models/PayrollRun.js';
import { PayrollRecord } from './models/PayrollRecord.js';
import { Bonus } from './models/Bonus.js';
import { Reimbursement } from './models/Reimbursement.js';
import { TaxDeclaration } from './models/TaxDeclaration.js';
import { AuditLog } from './models/AuditLog.js';

async function seedPayroll() {
  try {
    console.log("Connecting to database for payroll seeding...");
    await sequelize.authenticate();
    console.log("Connection successful! Syncing new models...");
    
    // Sync new tables individually to avoid altering the already-existing employees columns
    await SalaryStructure.sync({ alter: true });
    await SalaryStructureHistory.sync({ alter: true });
    await PayrollRun.sync({ alter: true });
    await PayrollRecord.sync({ alter: true });
    await Bonus.sync({ alter: true });
    await Reimbursement.sync({ alter: true });
    await TaxDeclaration.sync({ alter: true });
    await AuditLog.sync({ alter: true });
    console.log("New tables synced successfully!");

    // Update existing employees with details
    console.log("Updating employee details with bank info, department, designation, and PAN...");
    
    // System Administrator
    await Employee.update({
      department: 'Management',
      designation: 'Project Director',
      bankName: 'HDFC Bank',
      accountNumber: '50100987654321',
      ifscCode: 'HDFC0000123',
      pan: 'ABCDE1234F',
      uan: '100987654321',
      pfNumber: 'MH/BAN/0012345/000/0078901',
      joinDate: '2023-01-15'
    }, { where: { id: 1 } });

    // Core Developer
    await Employee.update({
      department: 'Engineering',
      designation: 'Backend Architect',
      bankName: 'State Bank of India',
      accountNumber: '30456789120',
      ifscCode: 'SBIN0000301',
      pan: 'BCDEF2345G',
      uan: '100987654322',
      pfNumber: 'MH/BAN/0012345/000/0078902',
      joinDate: '2023-06-01'
    }, { where: { id: 2 } });

    // Project Manager
    await Employee.update({
      department: 'Management',
      designation: 'Scrum Master',
      bankName: 'ICICI Bank',
      accountNumber: '000401567890',
      ifscCode: 'ICIC0000004',
      pan: 'CDEFG3456H',
      uan: '100987654323',
      pfNumber: 'MH/BAN/0012345/000/0078903',
      joinDate: '2024-02-10'
    }, { where: { id: 3 } });

    // QA Specialist
    await Employee.update({
      department: 'Quality Assurance',
      designation: 'Senior QA Analyst',
      bankName: 'Axis Bank',
      accountNumber: '912010023456789',
      ifscCode: 'UTIB0000012',
      pan: 'DEFGH4567I',
      uan: '100987654324',
      pfNumber: 'MH/BAN/0012345/000/0078904',
      joinDate: '2025-06-01'
    }, { where: { id: 4 } });

    // HR Executive
    await Employee.update({
      department: 'Human Resources',
      designation: 'Lead recruiter',
      bankName: 'Kotak Mahindra Bank',
      accountNumber: '1234567890',
      ifscCode: 'KKBK0000123',
      pan: 'EFGHI5678J',
      uan: '100987654325',
      pfNumber: 'MH/BAN/0012345/000/0078905',
      joinDate: '2022-11-01'
    }, { where: { id: 5 } });

    console.log("Employees updated successfully.");

    // Seed salary structures
    console.log("Seeding salary structures...");
    const salaryStructures = [
      { employeeId: 1, basicPay: 50000, hra: 20000, conveyance: 5000, medical: 3000, specialAllowance: 15000, otherAllowance: 10000, pf: 6000, esi: 0, professionalTax: 200 },
      { employeeId: 2, basicPay: 40000, hra: 16000, conveyance: 4000, medical: 2000, specialAllowance: 12000, otherAllowance: 8000, pf: 4800, esi: 0, professionalTax: 200 },
      { employeeId: 3, basicPay: 35000, hra: 14000, conveyance: 3000, medical: 2000, specialAllowance: 10000, otherAllowance: 6000, pf: 4200, esi: 0, professionalTax: 200 },
      { employeeId: 4, basicPay: 25000, hra: 10000, conveyance: 2000, medical: 2000, specialAllowance: 8000, otherAllowance: 5000, pf: 3000, esi: 0, professionalTax: 200 },
      { employeeId: 5, basicPay: 30000, hra: 12000, conveyance: 3000, medical: 2000, specialAllowance: 9000, otherAllowance: 6000, pf: 3600, esi: 0, professionalTax: 200 }
    ];

    for (const struct of salaryStructures) {
      const existing = await SalaryStructure.findOne({ where: { employeeId: struct.employeeId } });
      if (!existing) {
        await SalaryStructure.create(struct);
      } else {
        await existing.update(struct);
      }
    }

    console.log("Salary structures seeded successfully!");
  } catch (err) {
    console.error("Error seeding payroll data:", err);
  } finally {
    await sequelize.close();
  }
}

seedPayroll();
