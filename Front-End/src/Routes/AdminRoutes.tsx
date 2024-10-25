import { Route } from 'react-router-dom';
import AdminLoginPage from '../Pages/ADMIN/AdminLoginPage';
import AdminDashboard from '../Pages/ADMIN/AdminDashboard';
import AdminPrivateRoute from '../Components/AdminComponents/AdminPrivateRoute';
import AdminUser from '../Pages/ADMIN/AdminUserManagement';
import TheaterOwners from '../Pages/ADMIN/TheaterOwnerManagement';

export const AdminRoutes = (
  <Route path="/admin-dashboard" element={<AdminPrivateRoute />}>
    <Route index element={<AdminDashboard />} />
    <Route path="get-user" element={<AdminUser />} />
    <Route path="get-theaterOwner" element={<TheaterOwners />} />
  </Route>
);

export const AdminLoginRoute = <Route path="/admin-login" element={<AdminLoginPage />} />;
