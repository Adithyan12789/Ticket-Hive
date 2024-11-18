import express from 'express';
import UserController from '../Controllers/UserController';
import { AuthMiddleware } from '../Middlewares/AuthMiddleware';
import MulterConfig from '../Config/Multer/UserMulter';
import MovieController from '../Controllers/MovieController';
import TheaterController from '../Controllers/TheaterController';
import ScreenController from '../Controllers/ScreenController';

const router = express.Router();

router.post('/auth', UserController.authUser);
router.post('/googleLogin', UserController.googleLogin);
router.post('/signup', UserController.registerUser);
router.post('/verifyotp', UserController.verifyOTP);
router.post('/resend-otp', UserController.resendOtp);
router.post('/forgot-password', UserController.forgotPassword);
router.put('/reset-password/:token', UserController.resetPassword);

router.route('/profile')
.get( AuthMiddleware.protect, UserController.getUserProfile )
.put( AuthMiddleware.protect, MulterConfig.multerUploadUserProfile.single('profileImage'), UserController.updateUserProfile);

router.get('/get-movies',AuthMiddleware.protect, MovieController.getAllMoviesController);
router.get('/movie-detail/:id',AuthMiddleware.protect, MovieController.getMovieByIdHandler);
router.get('/movie-theaters/:movieTitle', AuthMiddleware.protect, TheaterController.getTheatersByMovieTitle);
router.get('/screen/:screenId', AuthMiddleware.protect, ScreenController.getScreensById);
router.post('/book-ticket', AuthMiddleware.protect, UserController.createBooking);



router.post('/logout', UserController.logoutUser);

export default router;
