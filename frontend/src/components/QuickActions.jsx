function QuickActions() {
  return (
    <div className="quick-actions-container">
      <h3 className="quick-actions-title">Quick Actions</h3>
      
      <div className="button-group">
        <button className="action-btn primary-btn">
          Add Employee
        </button>
        
        <button className="action-btn primary-btn">
          Run Payroll
        </button>
        
        <button className="action-btn secondary-btn">
          Approve Leave
        </button>
      </div>

      {/* Self-contained Stylesheet 
        This guarantees the styles apply without needing index.css
      */}
      <style>
        {`
          .quick-actions-container {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 24px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(14, 165, 233, 0.05);
            border: 1px solid rgba(255, 255, 255, 1);
            font-family: 'Inter', system-ui, sans-serif;
          }

          .quick-actions-title {
            margin: 0 0 20px 0;
            font-size: 20px;
            color: #0f172a;
            font-weight: 700;
          }

          .button-group {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }

          /* General Button Styling */
          .action-btn {
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* Buttery smooth animation */
          }

          /* Primary Button (Sky Blue Gradient) */
          .primary-btn {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: #ffffff;
            border: none;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
          }

          /* Secondary Button (Inverse styling for contrast) */
          .secondary-btn {
            background: #ffffff;
            color: #0ea5e9;
            border: 2px solid #bae6fd;
          }

          /* >>> THE HOVER EFFECTS: ZOOM & GLOW <<< */
          .primary-btn:hover {
            transform: scale(1.06) translateY(-4px); /* Zooms up and in */
            box-shadow: 0 15px 30px rgba(14, 165, 233, 0.5); /* Strong Sky Blue Glow */
          }

          .secondary-btn:hover {
            transform: scale(1.06) translateY(-4px);
            background: #f0f9ff;
            border-color: #7dd3fc;
            box-shadow: 0 15px 30px rgba(14, 165, 233, 0.2); /* Soft Sky Blue Glow */
          }

          /* Click effect (squish down slightly when clicked) */
          .action-btn:active {
            transform: scale(0.98) translateY(0);
            box-shadow: 0 2px 5px rgba(14, 165, 233, 0.2);
          }
        `}
      </style>
    </div>
  );
}

export default QuickActions;