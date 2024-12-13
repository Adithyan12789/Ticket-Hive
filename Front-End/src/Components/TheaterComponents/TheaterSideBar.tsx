import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFilm,
  FaUsers,
  FaTicketAlt,
  FaTag,
  FaCogs,
  FaComments,
} from "react-icons/fa";
import "./TheaterSidebar.css";

const TheaterOwnerSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Theater Owner Dashboard</h2>
      <ul className="sidebar-links">
        <li>
          <Link
            to="/theater"
            className={
              location.pathname === "/theater"
                ? "active sidebar-link"
                : "sidebar-link"
            }
          >
            <FaHome className="sidebar-icon" /> Theater Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/theater/management"
            className={
              location.pathname === "/theater/management" ||
              location.pathname === "/theater/details" ||
              location.pathname === "/theater/edit"
                ? "active sidebar-link"
                : "sidebar-link"
            }
          >
            <FaFilm className="sidebar-icon" /> Theater Management
          </Link>
        </li>
        <li>
          <Link
            to="/user-management"
            className={
              location.pathname === "/user/management"
                ? "active sidebar-link"
                : "sidebar-link"
            }
          >
            <FaUsers className="sidebar-icon" /> User Management
          </Link>
        </li>
        <li>
          <Link
            to="/admin/bookings"
            className={
              location.pathname === "/theater/bookings"
                ? "active sidebar-link"
                : "sidebar-link"
            }
          >
            <FaTicketAlt className="sidebar-icon" /> Bookings
          </Link>
        </li>
        <li>
          <Link
            to="/theater/offer-management"
            className={
              location.pathname === "/theater/offer-management"
                ? "active sidebar-link"
                : "sidebar-link"
            }
          >
            <FaTag className="sidebar-icon" /> Offers Management
          </Link>
        </li>
        <li>
          <Link
            to="/theater/chat"
            className={
              location.pathname === "/theater/chat"
                ? "active sidebar-link"
                : "sidebar-link"
            }
          >
            <FaComments className="sidebar-icon" /> Chat
          </Link>
        </li>
        <li>
          <Link
            to="/admin/settings"
            className={
              location.pathname === "/admin/settings"
                ? "active sidebar-link"
                : "sidebar-link"
            }
          >
            <FaCogs className="sidebar-icon" /> Settings
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">&copy; 2024 Admin Panel</div>
    </div>
  );
};

export default TheaterOwnerSidebar;
