import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaFilm,
  FaUsers,
  FaTicketAlt,
  FaCogs,
  FaCheck,
  FaComments,
} from "react-icons/fa";
import "./AdminSidebar.css";
import { AdminSidebarProps } from "../../Types/AdminTypes";
import { MdMovie } from "react-icons/md";

const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminName }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Welcome, {adminName}</h2>
      <ul className="sidebar-links">
        <li>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaHome className="sidebar-icon" /> Admin Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/get-user"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaUsers className="sidebar-icon" /> User Management
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/get-theaterOwner"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaFilm className="sidebar-icon" /> Theater Management
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/get-movies"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdMovie className="sidebar-icon" /> Movies Management
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/verification"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaCheck className="sidebar-icon" /> Verification Requests
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/chat"
            className={
              location.pathname === "/admin/chat"
                ? "active sidebar-link"
                : "sidebar-link"
            }
          >
            <FaComments className="sidebar-icon" /> Chat
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/bookings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaTicketAlt className="sidebar-icon" /> Bookings
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaCogs className="sidebar-icon" /> Settings
          </NavLink>
        </li>
      </ul>
      <div className="sidebar-footer">&copy; 2024 Admin Panel</div>
    </div>
  );
};

export default AdminSidebar;
