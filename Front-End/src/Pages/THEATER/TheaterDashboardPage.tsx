import React from 'react';
import { Outlet } from 'react-router-dom';
import TheaterSidebar from '../../Components/TheaterComponents/TheaterSideBar';
import './TheaterDashboardPage.css';

const TheaterDashboard: React.FC = () => {
  return (
    <div className="theater-dashboard">

      <TheaterSidebar theaterOwnerName={'Adithyan'} />

      <div className="dashboard-content" style={{padding: "0px"}}>


        <div className="dashboard-main-content">
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TheaterDashboard;
