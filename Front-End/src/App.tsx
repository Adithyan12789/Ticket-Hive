import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Components/Header';

const App: React.FC = () => {
  const location = useLocation();

// Use a regular expression to check for dynamic routes like `/reset-password/:token`
  const hideHeader = location.pathname === '/login' 
      || location.pathname === '/signup' 
      || location.pathname === '/forgot-password' 
      || /^\/reset-password\/.+$/.test(location.pathname); // This checks for '/reset-password/:token'


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
