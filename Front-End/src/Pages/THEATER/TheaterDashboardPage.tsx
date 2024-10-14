import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../Components/TheaterComponents/TheaterSideBar'; 
import TheaterHeader from '../../Components/TheaterComponents/TheaterHeader';
import './TheaterDashboardPage.css'; 

const TheaterOwnerDashboard: React.FC = () => {
  return (
    <div className="theater-owner-dashboard">
      
      <Sidebar />

      <div className="dashboard-content" style={{padding: "0px"}}>
       
        <TheaterHeader />

        <div className="dashboard-main-content">
         
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TheaterOwnerDashboard;
