import { Link } from 'react-router-dom';
import './TheaterSidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Theater Dashboard</h2>
      <ul className="sidebar-links">
        <li>
          <Link to="/admin/movies">Movies Management</Link>
        </li>
        <li>
          <Link to="/admin/users">User Management</Link>
        </li>
        <li>
          <Link to="/admin/settings">Settings</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
