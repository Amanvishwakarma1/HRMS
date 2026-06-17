import ExpenseForm from "../components/ExpenseForm";

function SubmitExpense() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Expense submitted!");
  };

  return (
    <div style={{ padding: "32px", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", minHeight: "100vh", animation: "fadeIn 0.6s ease-out" }}>
      <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "8px", fontWeight: "800" }}>Submit Expense Claim</h1>
      <p style={{ color: "#475569", marginBottom: "24px" }}>Fill out the details below to request reimbursement.</p>
      
      <div style={{ background: "rgba(255, 255, 255, 0.85)", padding: "32px", borderRadius: "20px", border: "1px solid #fff", boxShadow: "0 10px 30px rgba(14, 165, 233, 0.05)" }}>
        <ExpenseForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default SubmitExpense;