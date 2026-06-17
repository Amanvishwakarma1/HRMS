function EmployeeTable({ employees }) {
  return (
    <div className="table-responsive">
      <table className="glass-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td style={{ fontWeight: "600", color: "#0f172a" }}>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.department}</td>
              <td>{emp.role}</td>
              <td>
                <span className={`status-badge ${emp.status === 'Active' ? 'status-active' : 'status-leave'}`}>
                  {emp.status}
                </span>
              </td>
              <td>
                <button className="text-btn edit-btn">Edit</button>
                <button className="text-btn delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>
        {`
          .table-responsive {
            width: 100%;
            overflow-x: auto;
          }
          .glass-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          .glass-table th {
            padding: 16px;
            color: #64748b;
            font-weight: 600;
            border-bottom: 2px solid rgba(14, 165, 233, 0.1);
          }
          .glass-table td {
            padding: 16px;
            color: #475569;
            border-bottom: 1px solid rgba(14, 165, 233, 0.1);
          }
          .glass-table tr:hover {
            background-color: rgba(14, 165, 233, 0.05);
            transition: background-color 0.2s ease;
          }
          .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .status-active {
            background-color: #dcfce7;
            color: #166534;
          }
          .status-leave {
            background-color: #fef08a;
            color: #854d0e;
          }
          .text-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 600;
            margin-right: 12px;
            transition: color 0.2s;
          }
          .edit-btn { color: #0ea5e9; }
          .edit-btn:hover { color: #0284c7; }
          .delete-btn { color: #ef4444; }
          .delete-btn:hover { color: #b91c1c; }
        `}
      </style>
    </div>
  );
}

export default EmployeeTable;