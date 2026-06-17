function ExpenseForm({ onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="expense-form">
      <div className="form-row">
        <div className="form-group">
          <label>Date incurred</label>
          <input type="date" className="glass-input" required />
        </div>
        <div className="form-group">
          <label>Amount ($)</label>
          <input type="number" step="0.01" className="glass-input" placeholder="0.00" required />
        </div>
      </div>
      
      <div className="form-group">
        <label>Category</label>
        <select className="glass-input">
          <option>Travel</option>
          <option>Meals & Entertainment</option>
          <option>Office Supplies</option>
          <option>Equipment</option>
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>
        <input type="text" className="glass-input" placeholder="e.g. Flight to NYC" required />
      </div>

      <button type="submit" className="action-btn" style={{ marginTop: "12px" }}>Submit Expense</button>

      <style>
        {`
          .expense-form { display: flex; flex-direction: column; gap: 20px; max-width: 600px; }
          .form-row { display: flex; gap: 20px; }
          .form-row .form-group { flex: 1; }
          .form-group { display: flex; flex-direction: column; gap: 8px; }
          .form-group label { font-weight: 600; color: #0f172a; font-size: 14px; }
          .glass-input {
            padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(14, 165, 233, 0.2);
            background: rgba(255, 255, 255, 0.9); color: #0f172a; font-family: inherit; transition: all 0.3s ease;
          }
          .glass-input:focus { outline: none; border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2); }
        `}
      </style>
    </form>
  );
}

export default ExpenseForm;