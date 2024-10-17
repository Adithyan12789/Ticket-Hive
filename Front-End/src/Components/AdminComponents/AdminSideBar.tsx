import { Link } from "react-router-dom";
import { FaFilm, FaUsers, FaCogs } from "react-icons/fa"; // Import modern icons
import "./AdminSidebar.css";

interface AdminSidebarProps {
  adminName: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminName }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Welcome, {adminName}</h2>{" "}
      {/* Display admin's name */}
      <ul className="sidebar-links">
        <li>
          <Link to="/admin-dashboard/admin-get-user">
            <FaUsers className="sidebar-icon" /> User Management
          </Link>
        </li>
        <li>
          <Link to="/admin/movies">
            <FaFilm className="sidebar-icon" /> Movies Management
          </Link>
        </li>
        <li>
          <Link to="/admin/settings">
            <FaCogs className="sidebar-icon" /> Settings
          </Link>
        </li><li>
          <Link to="/admin/settings">
            <FaCogs className="sidebar-icon" /> Settings
          </Link>
        </li><li>
          <Link to="/admin/settings">
            <FaCogs className="sidebar-icon" /> Settings
          </Link>
        </li><li>
          <Link to="/admin/settings">
            <FaCogs className="sidebar-icon" /> Settings
          </Link>
        </li><li>
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
