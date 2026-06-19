import { resubmitExpense } from './controllers/expenseController.js';
import { Expense } from './models/Expense.js';
import { ExpenseCategory } from './models/ExpenseCategory.js';
import { sequelize } from './config/db.js';

async function test() {
  try {
    console.log("Connecting to DB...");
    await sequelize.authenticate();
    console.log("DB connected successfully.");

    // Ensure category exists
    let category = await ExpenseCategory.findOne();
    if (!category) {
      category = await ExpenseCategory.create({
        name: 'Travel',
        maxLimit: 5000,
        description: 'Travel expenses'
      });
    }

    console.log("Creating an expense with status: Need Information...");
    const expense = await Expense.create({
      title: 'Mock Resubmit Test',
      categoryId: category.id,
      amount: 1500,
      expenseDate: '2026-06-19',
      currency: 'INR',
      project: 'Apollo',
      description: 'Dinner',
      paymentMethod: 'Card',
      location: 'Bangalore',
      status: 'Need Information',
      employeeId: 4
    });

    console.log(`Created expense ID: ${expense.id}`);

    const req = {
      params: { id: expense.id },
      body: {
        description: "Updated description in resubmit",
        amount: 1600
      },
      user: { id: 4, role: 'employee', username: 'QA Specialist' },
      ip: '127.0.0.1'
    };

    const res = {
      status(code) {
        console.log(`Response Status Code: ${code}`);
        return this;
      },
      json(data) {
        console.log("Response JSON Data:", JSON.stringify(data, null, 2));
        return this;
      }
    };

    console.log("Calling resubmitExpense controller...");
    await resubmitExpense(req, res);
    console.log("Call complete.");
    process.exit(0);
  } catch (err) {
    console.error("Caught error in test execution:", err);
    process.exit(1);
  }
}

test();
