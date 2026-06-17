import "./Navbar.css";
import { Bell, Search, MessageSquare } from "lucide-react";

function Navbar() {
  return (
    <div className="navbar">

      <div className="navbar-left"></div>

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search..."
        />
      </div>

      <div className="navbar-right">

        <div className="icon-btn">
          <Bell size={20} />
        </div>

        <div className="icon-btn">
          <MessageSquare size={20} />
        </div>

        <div className="profile-section">
          <div className="profile-avatar">
            A
          </div>

          <div className="profile-info">
            <h4>Admin</h4>
            <p>HR Manager</p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Navbar;