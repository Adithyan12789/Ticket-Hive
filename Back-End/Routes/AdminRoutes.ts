import express from 'express';
import { MovieController } from '../Controllers/MovieController';
import { AdminAuthMiddleware } from '../Middlewares/AdminAuthMiddleware';
import TheaterMulterConfig from '../Config/Multer/TheaterMulter';
import MovieImageUploads from '../Config/Multer/MovieMulter';
import { BookingController } from '../Controllers/BookingController';
import { ChatController } from '../Controllers/ChatController';
import { TheaterController } from '../Controllers/TheaterController';
import { AdminController } from '../Controllers/AdminController';
import { container } from '../Config/Container';

const router = express.Router();

const adminController = container.get<AdminController>("AdminController");
const theaterControllerr = container.get<TheaterController>("TheaterController");
const bookingControllerr = container.get<BookingController>("BookingController");
const chatControllerr = container.get<ChatController>("ChatController");
const movieControllerr = container.get<MovieController>("MovieController");

router.post('/admin-login', adminController.adminLogin);
router.get('/get-user', AdminAuthMiddleware.protect, adminController.getAllUsers);
router.get('/get-theaterOwners', AdminAuthMiddleware.protect, adminController.getAllTheaterOwners);
router.patch('/block-user', AdminAuthMiddleware.protect, adminController.blockUserController);
router.patch('/unblock-user', AdminAuthMiddleware.protect, adminController.unblockUserController);
router.patch('/block-theaterOwner', AdminAuthMiddleware.protect, adminController.blockTheaterOwnerController);
router.patch('/unblock-theaterOwner', AdminAuthMiddleware.protect, adminController.unblockTheaterOwnerController);
router.get('/verification',AdminAuthMiddleware.protect,adminController.getVerificationDetails) 
router.put('/verification/:theaterId/accept',AdminAuthMiddleware.protect,adminController.acceptVerification) 
router.put('/verification/:adminId/reject', AdminAuthMiddleware.protect,adminController.rejectVerification); 

router.post(
  '/add-movie',
  MovieImageUploads.multerUploadMultipleFields,
  (req, res, next) => {
    next();
  },
  movieControllerr.addMovieController
);


router.get('/get-movies',AdminAuthMiddleware.protect, movieControllerr.getAllMoviesController);

router.get('/movie-details/:id',AdminAuthMiddleware.protect, movieControllerr.getMovieByIdHandler);
router.put('/movie-edit/:id',
  MovieImageUploads.multerUploadMultipleFields,
  (req, res, next) => {
    next();
  },
  movieControllerr.updateMovieHandler
);

router.delete('/movie-delete/:id',AdminAuthMiddleware.protect, movieControllerr.deleteMovieHandler);

router.get('/getAlltickets', AdminAuthMiddleware.protect, adminController.getAllTickets);
router.get("/get-ticketDetail/:bookingId", AdminAuthMiddleware.protect, bookingControllerr.getBookingDetails);
router.put("/tickets/:ticketId", AdminAuthMiddleware.protect, bookingControllerr.updateTicket);
router.get("/theater/:theaterId/bookings", AdminAuthMiddleware.protect, bookingControllerr.getTheaterBookings);
router.patch('/statusChange/:bookingId', AdminAuthMiddleware.protect, bookingControllerr.updateBookingStatus);

router.get('/get-theaterOwners',AdminAuthMiddleware.protect, theaterControllerr.getTheaterOwners);

router.get('/chatrooms/:adminId',AdminAuthMiddleware.protect, chatControllerr.getAdminChatRooms); 
router.route('/chatrooms/:chatRoomId/messages').get(AdminAuthMiddleware.protect, chatControllerr.getAdminMessages).post(TheaterMulterConfig.multerUploadChatFiles.single('file'),AdminAuthMiddleware.protect, chatControllerr.sendAdminMessage); 
router.route('/mark-messages-read').post(AdminAuthMiddleware.protect, chatControllerr.markAdminMessagesAsRead); 
router.get('/notifications/unread',AdminAuthMiddleware.protect, chatControllerr.getAdminUnreadMessages); 
router.put('/notifications/:id/read',AdminAuthMiddleware.protect, chatControllerr.markAdminMessagesAsRead); 


router.post('/admin-logout', adminController.adminLogout);
 
export default router;
