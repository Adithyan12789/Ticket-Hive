import express from 'express';
import TheaterController from '../Controllers/TheaterController';
import ScreenController from '../Controllers/ScreenController';
import { TheaterAuthMiddleware } from '../Middlewares/TheaterAuthMiddleware';
import MulterConfig from '../Config/Multer/TheaterMulter';
import MovieController from '../Controllers/MovieController';

const router = express.Router();

router.post('/theater-login', TheaterController.authTheaterOwner);
router.post('/theater-GoogleLogin', TheaterController.googleLoginTheaterOwner);
router.post('/theater-signup', TheaterController.registerTheaterOwner);
router.post('/theater-verifyotp', TheaterController.verifyTheaterOwnerOTP);
router.post('/theater-resend-otp', TheaterController.resendTheaterOwnerOtp);
router.post('/theater-forgot-password', TheaterController.forgotTheaterOwnerPassword);
router.put('/theater-reset-password/:token', TheaterController.resetTheaterOwnerPassword);

router.route('/theater-profile')
.get( TheaterAuthMiddleware.protect, TheaterController.getTheaterProfile )
.put( TheaterAuthMiddleware.protect, MulterConfig.multerUploadTheaterProfile.single('profileImage'), TheaterController.updateTheaterProfile);

router.post('/upload-certificate/:theaterId', TheaterAuthMiddleware.protect, MulterConfig.multerUploadCertificatesImages.single('certificate'), TheaterController.uploadVerificationDetailsHandler); 

router.post("/add-theaters",TheaterAuthMiddleware.protect, MulterConfig.multerUploadTheaterImages.array("images", 3),TheaterController.addTheaterController);
router.get('/get-theaters',TheaterAuthMiddleware.protect, TheaterController.getTheaters);

router.route('/theaters/:id')
    .get(TheaterAuthMiddleware.protect, TheaterController.getTheaterByIdHandler)
    .put(TheaterAuthMiddleware.protect, MulterConfig.multerUploadTheaterImages.array("images", 3), TheaterController.updateTheaterHandler)
    .delete(TheaterAuthMiddleware.protect, TheaterController.deleteTheaterHandler);


router.post('/add-screen/:theaterId', TheaterAuthMiddleware.protect, ScreenController.addScreen); 
router.put('/update-screen/:screenId', TheaterAuthMiddleware.protect, ScreenController.updateScreen);
router.delete('/delete-screen/:screenId', TheaterAuthMiddleware.protect, ScreenController.deleteScreen);
router.get('/theaters/:id/screens', TheaterAuthMiddleware.protect, ScreenController.getScreensByTheaterId);
router.get('/screen/:screenId', TheaterAuthMiddleware.protect, ScreenController.getScreensById);

router.get('/get-movies',TheaterAuthMiddleware.protect, MovieController.getAllMoviesController);


router.post('/theater-logout', TheaterController.logoutTheaterOwner);

export default router;