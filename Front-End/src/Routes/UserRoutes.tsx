import { Route } from 'react-router-dom';
import HomePage from '../Pages/USER/HomePage';
import LoginPage from '../Pages/USER/LoginPage';
import RegisterPage from '../Pages/USER/RegisterPage';
import ForgotPassword from '../Pages/USER/ForgetPasswordPage';
import ResetPassword from '../Pages/USER/ResetPasswordPage';
import UserProfilePage from '../Pages/USER/UserProfilePage';
import PrivateRoute from '../Components/UserComponents/PrivateRoute';

export const UserRoutes = (
  <>
    <Route index element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<RegisterPage />} />
    <Route path="/verifyotp" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />

    <Route path="" element={<PrivateRoute />}>
      <Route path="/profile" element={<UserProfilePage />} />
    </Route>
  </>
);