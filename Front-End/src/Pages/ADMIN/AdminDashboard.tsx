import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../Components/AdminComponents/AdminSideBar';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard">

      <Sidebar adminName={'Adithyan'} />

      <div className="dashboard-content" style={{padding: "0px"}}>


        <div className="dashboard-main-content">
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
