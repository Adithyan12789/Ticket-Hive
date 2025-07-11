import { Route } from 'react-router-dom';
import HomePage from '../Pages/USER/HomePage';
import LoginPage from '../Pages/USER/LoginPage';
import RegisterPage from '../Pages/USER/RegisterPage';
import ForgotPassword from '../Pages/USER/ForgetPasswordPage';
import ResetPassword from '../Pages/USER/ResetPasswordPage';
import UserProfilePage from '../Pages/USER/UserProfilePage';
import PrivateRoute from '../Components/UserComponents/PrivateRoute';
import MovieDetailScreen from '../Pages/USER/MovieDetailPage';
import MovieTheaterScreen from '../Pages/USER/MovieTheaterPage';
import SelectSeatPage from '../Pages/USER/SeatSelectionPage';
import BookingPage from '../Pages/USER/BookingPage';
import ThankYou from '../Pages/USER/ThankyouPage';
import TicketsScreen from '../Pages/USER/TicketsPage';
import TicketDetailsScreen from '../Pages/USER/TicketDetailsPage';
import AllMoviesPage from '../Pages/USER/AllMoviesPage';
import WalletPage from '../Pages/USER/WalletPage';

export const UserRoutes = (
  <>
    <Route index element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/sign-up" element={<RegisterPage />} />
    <Route path="/verifyotp" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />

    <Route path="" element={<PrivateRoute />}>
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/movie-detail/:id" element={<MovieDetailScreen />} />
      <Route path="/movie-theaters/:movieTitle" element={<MovieTheaterScreen />} />
      <Route path="/seat-select/:screenId" element={<SelectSeatPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/thankyou" element={<ThankYou />} />
      <Route path="/tickets" element={<TicketsScreen />} />
      <Route path="/ticket/:bookingId" element={<TicketDetailsScreen />} />

      <Route path="/allMovies" element={<AllMoviesPage />} />
      <Route path="/wallet" element={<WalletPage />} />
    </Route>
  </>
);  
