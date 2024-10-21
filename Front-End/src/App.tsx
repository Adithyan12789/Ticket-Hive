import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Components/UserComponents/Header';
import TheaterHeader from "./Components/TheaterComponents/TheaterHeader";
import AdminHeader from "./Components/AdminComponents/AdminHeader";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 

const App: React.FC = () => {
  const location = useLocation();

  const isSignInPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  const isAdminSignInPage = location.pathname === "/admin-login";
  const isForgotPasswordPage = location.pathname === "/forgot-password";
  const isResetPasswordPage = /^\/reset-password\/.+$/.test(location.pathname);

  const isTheaterSignInPage = location.pathname === "/theater-login";
  const isTheaterSignUpPage = location.pathname === "/theater-signup";
  const isTheaterForgotPasswordPage = location.pathname === "/theater-forgot-password";
  const isTheaterResetPasswordPage = /^\/theater-reset-password\/.+$/.test(location.pathname); 

  const isOtpPage = location.pathname === "/verifyotp" || location.pathname === "/theater-verify-otp";

  const isAdminPage = location.pathname.startsWith("/admin");
  const isTheaterPage = location.pathname.startsWith("/theater");

  if (isSignInPage || isSignUpPage || isOtpPage || isForgotPasswordPage 
         || isResetPasswordPage || isAdminSignInPage || isTheaterSignInPage 
         || isTheaterSignUpPage || isTheaterForgotPasswordPage || isTheaterResetPasswordPage) {
    return (
      <>
        <ToastContainer />
        <Outlet />
      </>
    );
  }

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
