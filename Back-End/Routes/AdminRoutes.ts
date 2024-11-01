import express from 'express';
import AdminController from '../Controllers/AdminController';
import MovieController from '../Controllers/MovieController';
import { AdminAuthMiddleware } from '../Middlewares/AdminAuthMiddleware';
import MulterConfig from '../Config/Multer';

const router = express.Router();

router.post('/admin-login', AdminController.adminLogin);
router.post('/get-user', AdminAuthMiddleware.protect, AdminController.getAllUsers);
router.post('/get-theaterOwners', AdminAuthMiddleware.protect, AdminController.getAllTheaterOwners);
router.patch('/block-user', AdminAuthMiddleware.protect, AdminController.blockUserController);
router.patch('/unblock-user', AdminAuthMiddleware.protect, AdminController.unblockUserController);
router.patch('/block-theaterOwner', AdminAuthMiddleware.protect, AdminController.blockTheaterOwnerController);
router.patch('/unblock-theaterOwner', AdminAuthMiddleware.protect, AdminController.unblockTheaterOwnerController);
router.get('/verification',AdminAuthMiddleware.protect,AdminController.getVerificationDetails) 
router.put('/verification/:theaterId/accept',AdminAuthMiddleware.protect,AdminController.acceptVerification) 
router.put('/verification/:adminId/reject', AdminAuthMiddleware.protect,AdminController.rejectVerification); 

router.post("/add-movie",
    AdminAuthMiddleware.protect,
    MulterConfig.multerUploadMoviePosters.single("poster"),
    MovieController.addMovieController
);

router.get('/get-movies',AdminAuthMiddleware.protect, MovieController.getAllMoviesController);

router.get('/movie-details/:id',AdminAuthMiddleware.protect, MovieController.getMovieByIdHandler);
router.put('/movie-edit/:id',AdminAuthMiddleware.protect, MulterConfig.multerUploadMoviePosters.single("poster"), MovieController.updateMovieHandler);
router.delete('/movie-delete/:id',AdminAuthMiddleware.protect, MovieController.deleteMovieHandler);

router.post('/admin-logout', AdminController.adminLogout);
 
export default router;
