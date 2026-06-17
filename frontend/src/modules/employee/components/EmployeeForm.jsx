function EmployeeForm({ onSubmit, buttonText }) {
  return (
    <form onSubmit={onSubmit} className="employee-form">
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" className="glass-input" placeholder="e.g. John Doe" required />
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" className="glass-input" placeholder="john@company.com" required />
      </div>
      <div className="form-group">
        <label>Department</label>
        <select className="glass-input">
          <option>Engineering</option>
          <option>Human Resources</option>
          <option>Design</option>
        </select>
      </div>
      <button type="submit" className="action-btn">{buttonText}</button>

      <style>
        {`
          .employee-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
            max-width: 500px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .form-group label {
            font-weight: 600;
            color: #0f172a;
            font-size: 14px;
          }
          .glass-input {
            padding: 12px 16px;
            border-radius: 10px;
            border: 1px solid rgba(14, 165, 233, 0.2);
            background: rgba(255, 255, 255, 0.9);
            color: #0f172a;
            font-family: inherit;
            transition: all 0.3s ease;
          }
          .glass-input:focus {
            outline: none;
            border-color: #0ea5e9;
            box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
          }
        `}
      </style>
    </form>
  );
}

export default EmployeeForm;