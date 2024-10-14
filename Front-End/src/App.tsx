import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Components/Header';
import Footer from './Components/Footer';
import './App.css'; 

const App: React.FC = () => {
  const location = useLocation();

  const hideHeader = location.pathname === '/login' 
      || location.pathname === '/signup' 
      || location.pathname === '/forgot-password' 
      || /^\/reset-password\/.+$/.test(location.pathname)
      || location.pathname === '/admin-login' 
      || location.pathname === '/admin-dashboard' 
      || location.pathname === '/theater-login' 
      || location.pathname === '/theater-signup' 
      || location.pathname === '/theater'
      || location.pathname === '/theater-forgot-password'
      || /^\/theater-reset-password\/.+$/.test(location.pathname);
      

  return (
    <div className="app-container">
      {!hideHeader && <Header />}
      
      <main className="main-content">
        <Outlet />
      </main>

      {!hideHeader && <Footer />}
      
      <ToastContainer />
    </div>
  );
};

export default App;
