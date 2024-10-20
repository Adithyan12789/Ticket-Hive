import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// import './index.css';
import store from './Store';
import { Provider } from 'react-redux';
import LoginPage from './Pages/USER/LoginPage';
import RegisterPage from './Pages/USER/RegisterPage';
import ForgotPassword from './Pages/USER/ForgetPasswordPage';
import ResetPassword from './Pages/USER/ResetPasswordPage';
import HomePage from "./Pages/USER/HomePage";
import AdminLoginPage from './Pages/ADMIN/AdminLoginPage';
import AdminDashboard from './Pages/ADMIN/AdminDashboard';
import AdminPrivateRoute from "./Components/AdminComponents/AdminPrivateRoute.jsx";
import TheaterLoginPage from "./Pages/THEATER/TheaterLoginPage";
import TheaterRegisterPage from "./Pages/THEATER/TheaterRegisterPage";
import TheaterHomePage from "./Pages/THEATER/TheaterDashboardPage.js";
import TheaterForgotPasswordPage from "./Pages/THEATER/TheaterForgetPassword";
import TheaterResetPassword from "./Pages/THEATER/TheaterResetPassword";
import AdminUser from "./Pages/ADMIN/AdminUserManagement.js"
import TheaterOwners from "./Pages/ADMIN/TheaterOwnerManagement.js"
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import PrivateRoute from './Components/UserComponents/PrivateRoute.js';
import UserProfilePage from './Pages/USER/UserProfilePage.js';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}> 


    {/* Admin Routes */}
    <Route path="/admin-dashboard" element={<AdminPrivateRoute />}>
        <Route index element={<AdminDashboard />} />
        <Route path="get-user" element={<AdminUser />} />
        <Route path="get-theaterOwner" element={<TheaterOwners />} />
      </Route>
    <Route path="/admin-login" element={<AdminLoginPage />} />

      {/* User Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/verifyotp" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<UserProfilePage />} />
      </Route>

      {/* Theater Owner Routes */}
      <Route path="/theater" element={<TheaterHomePage />} />
      <Route path="/theater-login" element={<TheaterLoginPage />} />
      <Route path="/theater-signup" element={<TheaterRegisterPage />} />
      <Route path="/theater-verifyotp" element={<TheaterRegisterPage />} />
      <Route path="/theater-forgot-password" element={<TheaterForgotPasswordPage />} />
      <Route path="/theater-reset-password/:token" element={<TheaterResetPassword />} />
    </Route>
  )
);



ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
