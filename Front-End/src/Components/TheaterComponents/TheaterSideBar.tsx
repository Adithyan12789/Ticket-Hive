import { Link } from "react-router-dom";
import { FaHome, FaFilm, FaUsers, FaTicketAlt, FaTag, FaCogs } from "react-icons/fa"; // Updated icons
import "./TheaterSidebar.css";

interface TheaterOwnerSidebarProps {
  theaterOwnerName: string;
}

const TheaterOwnerSidebar: React.FC<TheaterOwnerSidebarProps> = ({ theaterOwnerName }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Welcome, {theaterOwnerName}</h2> {/* Display admin's name */}
      <ul className="sidebar-links">
        <li>
          <Link to="/theater">
            <FaHome className="sidebar-icon" /> Theater Dashboard
          </Link>
        </li>
        <li>
          <Link to="/Theater/theater-get-user">
            <FaUsers className="sidebar-icon" /> User Management
          </Link>
        </li>
        <li>
          <Link to="/admin/movies">
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

export default TheaterOwnerSidebar;
