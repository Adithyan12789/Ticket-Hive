import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Components/Header';

const App: React.FC = () => {
  const location = useLocation();

  // Check if the current path is login or signup
  const hideHeader = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {/* Only render Header if not on login or signup pages */}
      {!hideHeader && <Header />}
      <ToastContainer />
      <Outlet />
    </>
  );
};

export default App;
