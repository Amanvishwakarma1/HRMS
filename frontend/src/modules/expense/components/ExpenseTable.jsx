function ExpenseTable({ expenses }) {
  return (
    <div className="table-responsive">
      <table className="glass-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td style={{ fontWeight: "600", color: "#0f172a" }}>{exp.id}</td>
              <td>{exp.date}</td>
              <td>{exp.description}</td>
              <td>{exp.category}</td>
              <td style={{ fontWeight: "700" }}>${exp.amount.toFixed(2)}</td>
              <td>
                <span className={`status-badge status-${exp.status.toLowerCase()}`}>
                  {exp.status}
                </span>
              </td>
              <td>
                <button className="text-btn view-btn">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>
        {`
          .table-responsive { width: 100%; overflow-x: auto; }
          .glass-table { width: 100%; border-collapse: collapse; text-align: left; }
          .glass-table th { padding: 16px; color: #64748b; font-weight: 600; border-bottom: 2px solid rgba(14, 165, 233, 0.1); }
          .glass-table td { padding: 16px; color: #475569; border-bottom: 1px solid rgba(14, 165, 233, 0.1); }
          .glass-table tr:hover { background-color: rgba(14, 165, 233, 0.05); transition: background-color 0.2s ease; }
          
          .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status-approved { background-color: #dcfce7; color: #166534; }
          .status-pending { background-color: #fef08a; color: #854d0e; }
          .status-rejected { background-color: #fee2e2; color: #991b1b; }
          
          .text-btn { background: none; border: none; cursor: pointer; font-weight: 600; transition: color 0.2s; }
          .view-btn { color: #0ea5e9; }
          .view-btn:hover { color: #0284c7; }
        `}
      </style>
    </div>
  );
}

export default ExpenseTable;