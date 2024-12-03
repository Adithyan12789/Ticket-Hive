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

router.post('/save-location', AuthMiddleware.protect, UserController.saveLocationController);

router.route('/profile')
.get( AuthMiddleware.protect, UserController.getUserProfile )
.put( AuthMiddleware.protect, MulterConfig.multerUploadUserProfile.single('profileImage'), UserController.updateUserProfile);

router.get('/get-movies',AuthMiddleware.protect, MovieController.getAllMoviesController);
router.get('/movie-detail/:id',AuthMiddleware.protect, MovieController.getMovieByIdHandler);

router.get('/reviews/:movieId',AuthMiddleware.protect, MovieController.getReviewsController);
router.get('/allReviews',AuthMiddleware.protect, MovieController.getAllReviewsController);
router.post('/reviews',AuthMiddleware.protect, MovieController.addReviewsController);

router.get('/movie-theaters/:movieTitle', AuthMiddleware.protect, TheaterController.getTheatersByMovieTitle);

router.get('/screen/:screenId', AuthMiddleware.protect, ScreenController.getScreensById);

router.post('/update-availability', AuthMiddleware.protect, ScreenController.updateSeatAvailability);

router.get('/offers/:theaterId', AuthMiddleware.protect, UserController.getOffersByTheaterId);
  
router.post('/book-ticket', AuthMiddleware.protect, BookingController.createBooking);
router.get('/get-tickets/:userId', AuthMiddleware.protect, BookingController.getAllTickets);
router.get("/tickets/:ticketId", AuthMiddleware.protect, BookingController.getTicketDetails);
router.post('/cancel-ticket/:bookingId', AuthMiddleware.protect, BookingController.cancelTicket);

router.post('/create-wallet-transaction', WalletController.addMoneyToWallet);
router.get('/transaction-history/:userId', WalletController.getTransactionHistory);

router.post('/logout', UserController.logoutUser);

export default router;
