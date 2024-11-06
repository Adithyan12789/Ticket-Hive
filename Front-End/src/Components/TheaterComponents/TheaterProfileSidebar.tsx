import { NavLink, useLocation } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./TheaterProfileSidebar.css";

const TheaterOwnerProfileSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="theater-sidebar">
      <ul className="theater-sidebar-links">
        <li>
          <NavLink
            to="/theater"
            className={({ isActive }) =>
              isActive ? "theater-sidebar-link active" : "theater-sidebar-link"
            }
          >
            <FaUser className="theater-sidebar-icon" /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/theater-profile"
            className={({ isActive }) =>
              isActive || location.pathname === "/"
                ? "theater-sidebar-link active"
                : "theater-sidebar-link"
            }
          >
            <FaUser className="theater-sidebar-icon" /> My Profile
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "theater-sidebar-link active" : "theater-sidebar-link"
            }
          >
            <FaCog className="theater-sidebar-icon" /> Booking Details
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/wallet"
            className={({ isActive }) =>
              isActive ? "theater-sidebar-link active" : "theater-sidebar-link"
            }
          >
            <FaCog className="theater-sidebar-icon" /> Wallet
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/theater-logout"
            className={({ isActive }) =>
              isActive ? "theater-sidebar-link active" : "theater-sidebar-link"
            }
          >
            <FaSignOutAlt className="theater-sidebar-icon" /> Log Out
          </NavLink>
        </li>
      </ul>
      <div className="theater-sidebar-footer">&copy; 2024 User Panel</div>
    </div>
  );
};

export default TheaterOwnerProfileSidebar;
