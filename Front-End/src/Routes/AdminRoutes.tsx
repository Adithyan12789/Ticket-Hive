import { Route } from 'react-router-dom';
import AdminLoginPage from '../Pages/ADMIN/AdminLoginPage';
import AdminDashboard from '../Pages/ADMIN/AdminDashboard';
import AdminPrivateRoute from '../Components/AdminComponents/AdminPrivateRoute';
import AdminUser from '../Pages/ADMIN/AdminUserManagement';
import TheaterOwners from '../Pages/ADMIN/TheaterOwnerManagement';
import VerificationRequests from '../Pages/ADMIN/VerificationRequests';
import MovieManagement from '../Pages/ADMIN/MoviesManagement';
import MovieDetailsPage from '../Pages/ADMIN/MovieDetailsPage';

export const AdminRoutes = (
  <Route path="/admin" element={<AdminPrivateRoute />}>
    <Route path='dashboard' element={<AdminDashboard />} />
    <Route path="verification" element={<VerificationRequests />} />
    <Route path="get-user" element={<AdminUser />} />
    <Route path="get-theaterOwner" element={<TheaterOwners />} />
    <Route path="add-movies" element={<MovieManagement />} />
    <Route path="get-movies" element={<MovieManagement />} />
    <Route path="movie-details/:id" element={<MovieDetailsPage />} />
  </Route>
);

export const AdminLoginRoute = <Route path="/admin-login" element={<AdminLoginPage />} />;