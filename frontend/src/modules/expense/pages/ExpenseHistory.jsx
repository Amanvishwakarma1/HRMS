import { useState, useEffect } from "react";
import ExpenseTable from "../components/ExpenseTable";
import { getExpenses } from "../services/expenseService";

function ExpenseHistory() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    getExpenses().then(data => setExpenses(data));
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Expense History</h1>
          <p>Track your submitted claims and their current approval status.</p>
        </div>
        <button className="action-btn">+ Submit New Expense</button>
      </div>

      <div className="glass-card">
        <ExpenseTable expenses={expenses} />
      </div>

      <style>
        {`
          .page-container {
            padding: 32px; display: flex; flex-direction: column; gap: 32px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            min-height: 100vh; animation: fadeIn 0.6s ease-out; font-family: 'Inter', system-ui, sans-serif;
          }
          .page-header { display: flex; justify-content: space-between; align-items: center; }
          .page-header h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
          .page-header p { color: #475569; margin: 0; }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px);
            padding: 24px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 1);
            box-shadow: 0 10px 30px rgba(14, 165, 233, 0.05);
          }
          
          /* Consistent Button Styling */
          .action-btn {
            background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #ffffff;
            border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer;
            transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
          }
          .action-btn:hover { transform: scale(1.03) translateY(-2px); box-shadow: 0 8px 20px rgba(14, 165, 233, 0.4); }
          
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>
    </div>
  );
}

export default ExpenseHistory;