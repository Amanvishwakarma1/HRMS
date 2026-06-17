import { Link } from "react-router-dom";

const Sidebar = () => {
    return(
        <div className="sidebar">
            <Link to = "/">Dashboard</Link>
            <Link to = "/employees">Employees</Link>
            <Link to = "/Attendance">Attendance</Link>
            <Link to = "/leave">Leave</Link>
            <Link to = "/payroll">Payroll</Link>
            <Link to = "/expenses">Expenses</Link>
        </div>
    );
}

export default Sidebar;