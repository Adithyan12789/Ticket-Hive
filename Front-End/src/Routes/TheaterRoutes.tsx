import { Route } from 'react-router-dom';
import TheaterHomePage from '../Pages/THEATER/TheaterDashboardPage';
import TheaterLoginPage from '../Pages/THEATER/TheaterLoginPage';
import TheaterRegisterPage from '../Pages/THEATER/TheaterRegisterPage';
import TheaterForgotPasswordPage from '../Pages/THEATER/TheaterForgetPassword';
import TheaterResetPassword from '../Pages/THEATER/TheaterResetPassword';
import TheaterProfilePage from '../Pages/THEATER/TheaterProfilePage';
import TheaterManagement from '../Pages/THEATER/TheaterManagement';
import TheaterPrivateRoute from '../Components/TheaterComponents/TheaterPrivateRoute';
import TheaterDetailPage from '../Pages/THEATER/TheaterDetailPage';
import AddScreenPage from '../Pages/THEATER/AddScreenPage';

export const TheaterRoutes = (
  <>
    <Route path="/theater" element={<TheaterHomePage />} />
    <Route path="/theater-login" element={<TheaterLoginPage />} />
    <Route path="/theater-signup" element={<TheaterRegisterPage />} />
    <Route path="/theater-verifyotp" element={<TheaterRegisterPage />} />
    <Route path="/theater-forgot-password" element={<TheaterForgotPasswordPage />} />
    <Route path="/theater-reset-password/:token" element={<TheaterResetPassword />} />

    <Route path="" element={<TheaterPrivateRoute />}>
      <Route path="/theater-profile" element={<TheaterProfilePage />} />
      <Route path="/theater/management" element={<TheaterManagement />} />
      <Route path="/theater/details/:id" element={<TheaterDetailPage />} />
      <Route path="/theater/edit/:id" element={<TheaterManagement />} />
      <Route path="/theater/add-screen/:theaterId" element={<AddScreenPage />} />
    </Route>
  </>
);
