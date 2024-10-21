import { Link } from "react-router-dom";
import { FaHome, FaFilm, FaUsers, FaTicketAlt, FaTag, FaCogs } from "react-icons/fa";
import "./AdminSidebar.css";

interface AdminSidebarProps {
  adminName: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminName }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Welcome, {adminName}</h2>
      <ul className="sidebar-links">
        <li>
          <Link to="/admin-dashboard">
            <FaHome className="sidebar-icon" /> Admin Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin-dashboard/get-user">
            <FaUsers className="sidebar-icon" /> User Management
          </Link>
        </li>
        <li>
          <Link to="/admin-dashboard/get-theaterOwner">
            <FaFilm className="sidebar-icon" /> Theater Management
          </Link>
        </li>
        <li>
          <Link to="/admin/bookings">
            <FaTicketAlt className="sidebar-icon" /> Bookings
          </Link>
        </li>
        <li>
          <Link to="/admin/coupons">
            <FaTag className="sidebar-icon" /> Coupon Management
          </Link>
        </li>
        <li>
          <Link to="/admin/settings">
            <FaCogs className="sidebar-icon" /> Settings
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">&copy; 2024 Admin Panel</div>
    </div>
  );
};

export default AdminSidebar;
