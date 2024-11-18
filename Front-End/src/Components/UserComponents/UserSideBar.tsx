import { Link, useLocation } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaWallet, FaSignOutAlt } from "react-icons/fa"; // Updated icons
import "./UserSidebar.css"; // Import external CSS

const UserProfileSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="user-sidebar">
      <ul className="user-sidebar-links">
        {/* Profile Link */}
        <li className="user-sidebar-item">
          <Link
            to="/profile"
            className={`user-sidebar-link ${location.pathname === "/profile" || location.pathname === "/" ? "active" : ""}`}
          >
            <FaUser className="user-sidebar-icon" /> My Profile
          </Link>
        </li>

        {/* Booking Details Link */}
        <li className="user-sidebar-item">
          <Link
            to="/booking-details"
            className={`user-sidebar-link ${location.pathname === "/booking-details" ? "active" : ""}`}
          >
            <FaCalendarAlt className="user-sidebar-icon" /> Booking Details
          </Link>
        </li>

        {/* Wallet Link */}
        <li className="user-sidebar-item">
          <Link
            to="/wallet"
            className={`user-sidebar-link ${location.pathname === "/wallet" ? "active" : ""}`}
          >
            <FaWallet className="user-sidebar-icon" /> Wallet
          </Link>
        </li>

        {/* Logout Link */}
        <li className="user-sidebar-item">
          <Link to="/logout" className="user-sidebar-link">
            <FaSignOutAlt className="user-sidebar-icon" /> Log Out
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div className="user-sidebar-footer">&copy; 2024 User Panel</div>
    </div>
  );
};

export default UserProfileSidebar;
