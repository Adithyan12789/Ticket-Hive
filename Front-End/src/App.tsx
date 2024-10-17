import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Components/Header';
import TheaterHeader from "./Components/TheaterComponents/TheaterHeader";
import AdminHeader from "./Components/AdminComponents/AdminHeader";
import './App.css'; 

const App: React.FC = () => {
  const location = useLocation();

  const isSignInPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  const isAdminSignInPage = location.pathname === "/admin-login";
  const isForgotPasswordPage = location.pathname === "/forgot-password"; // Corrected typo
  const isResetPasswordPage = /^\/reset-password\/.+$/.test(location.pathname); // Corrected typo and retained regex

  const isOtpPage = location.pathname === "/verifyotp" || location.pathname === "/theater-verify-otp";

  const isAdminPage = location.pathname.startsWith("/admin");
  const isTheaterPage = location.pathname.startsWith("/theater");

  // Show only the Outlet for authentication-related pages
  if (isSignInPage || isSignUpPage || isOtpPage || isForgotPasswordPage || isResetPasswordPage || isAdminSignInPage) {
    return (
      <>
        <ToastContainer />
        <Outlet />
      </>
    );
  }

  // Show different headers based on the route
  return (
    <>
      {isAdminPage ? (
        <AdminHeader />
      ) : isTheaterPage ? (
        <TheaterHeader />
      ) : (
        <Header />
      )}
      <ToastContainer />
      <Outlet />
    </>
  );
};

export default App;
