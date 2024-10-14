import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../Components/AdminComponents/AdminSideBar';
import AdminHeader from '../../Components/AdminComponents/AdminHeader'; 
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard">

      <Sidebar />

      <div className="dashboard-content" style={{padding: "0px"}}>

        <AdminHeader /> 

        <div className="dashboard-main-content">
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
