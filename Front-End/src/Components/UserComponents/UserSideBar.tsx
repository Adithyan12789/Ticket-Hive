import { Link, useLocation } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./UserSidebar.css";

const UserProfileSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="user-sidebar">
      <ul className="user-sidebar-links">
        <li>
          <Link
            to="/profile"
            className={location.pathname === "/profile" || location.pathname === "/" ? "active user-sidebar-link" : "user-sidebar-link"}
          >
            <FaUser className="user-sidebar-icon" /> My Profile
          </Link>
        </li>
        <li>
          <Link to="/settings" className="user-sidebar-link">
            <FaCog className="user-sidebar-icon" /> Booking Details
          </Link>
        </li>
        <li>
          <Link to="/wallet" className="user-sidebar-link">
            <FaCog className="user-sidebar-icon" /> Wallet
          </Link>
        </li>
        <li>
          <Link to="/logout" className="user-sidebar-link">
            <FaSignOutAlt className="user-sidebar-icon" /> Log Out
          </Link>
        </li>
      </ul>
      <div className="user-sidebar-footer">&copy; 2024 User Panel</div>
    </div>
  );
};

export default UserProfileSidebar;
