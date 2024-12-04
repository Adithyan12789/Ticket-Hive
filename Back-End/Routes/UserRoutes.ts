import express from 'express';
import UserController from '../Controllers/UserController';
import { AuthMiddleware } from '../Middlewares/AuthMiddleware';
import MulterConfig from '../Config/Multer/UserMulter';
import MovieController from '../Controllers/MovieController';
import TheaterController from '../Controllers/TheaterController';
import ScreenController from '../Controllers/ScreenController';
import BookingController from '../Controllers/BookingController';
import WalletController from '../Controllers/WalletController';

const router = express.Router();

router.post('/auth', UserController.authUser);
router.post('/googleLogin', UserController.googleLogin);
router.post('/signup', UserController.registerUser);
router.post('/verifyotp', UserController.verifyOTP);
router.post('/resend-otp', UserController.resendOtp);
router.post('/forgot-password', UserController.forgotPassword);
router.put('/reset-password/:token', UserController.resetPassword);

router.post('/refresh-token', UserController.refreshToken);

router.post('/save-location', AuthMiddleware, UserController.saveLocationController);

router.route('/profile')
.get( AuthMiddleware, UserController.getUserProfile )
.put( AuthMiddleware, MulterConfig.multerUploadUserProfile.single('profileImage'), UserController.updateUserProfile);

router.get('/get-movies',AuthMiddleware, MovieController.getAllMoviesController);
router.get('/movie-detail/:id',AuthMiddleware, MovieController.getMovieByIdHandler);

router.get('/reviews/:movieId',AuthMiddleware, MovieController.getReviewsController);
router.get('/allReviews',AuthMiddleware, MovieController.getAllReviewsController);
router.post('/reviews',AuthMiddleware, MovieController.addReviewsController);

router.get('/movie-theaters/:movieTitle', AuthMiddleware, TheaterController.getTheatersByMovieTitle);

router.get('/screen/:screenId', AuthMiddleware, ScreenController.getScreensById);

router.post('/update-availability', AuthMiddleware, ScreenController.updateSeatAvailability);

router.get('/offers/:theaterId', AuthMiddleware, UserController.getOffersByTheaterId);
  
router.post('/book-ticket', AuthMiddleware, BookingController.createBooking);
router.get('/get-tickets/:userId', AuthMiddleware, BookingController.getAllTickets);
router.get("/tickets/:ticketId", AuthMiddleware, BookingController.getTicketDetails);
router.post('/cancel-ticket/:bookingId', AuthMiddleware, BookingController.cancelTicket);

router.post('/create-wallet-transaction', AuthMiddleware, WalletController.addMoneyToWallet);
router.get('/transaction-history/:userId', AuthMiddleware, WalletController.getTransactionHistory);

router.post('/logout', UserController.logoutUser);

export default router;
