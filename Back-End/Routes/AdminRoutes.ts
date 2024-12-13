import express from 'express';
import AdminController from '../Controllers/AdminController';
import MovieController from '../Controllers/MovieController';
import { AdminAuthMiddleware } from '../Middlewares/AdminAuthMiddleware';
import TheaterMulterConfig from '../Config/Multer/TheaterMulter';
import MovieImageUploads from '../Config/Multer/MovieMulter';
import BookingController from '../Controllers/BookingController';
import ChatController from '../Controllers/ChatController';
import TheaterController from '../Controllers/TheaterController';

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

router.post(
  '/add-movie',
  MovieImageUploads.multerUploadMultipleFields,
  (req, res, next) => {
    next();
  },
  MovieController.addMovieController
);


router.get('/get-movies',AdminAuthMiddleware.protect, MovieController.getAllMoviesController);

router.get('/movie-details/:id',AdminAuthMiddleware.protect, MovieController.getMovieByIdHandler);
router.put('/movie-edit/:id',
  MovieImageUploads.multerUploadMultipleFields,
  (req, res, next) => {
    next();
  },
  MovieController.updateMovieHandler
);

router.delete('/movie-delete/:id',AdminAuthMiddleware.protect, MovieController.deleteMovieHandler);

router.get('/getAlltickets', AdminAuthMiddleware.protect, AdminController.getAllTickets);
router.get("/tickets/:ticketId", AdminAuthMiddleware.protect, BookingController.getTicketDetails);
router.put("/tickets/:ticketId", AdminAuthMiddleware.protect, BookingController.updateTicket);
router.get("/theater/:theaterId/bookings", AdminAuthMiddleware.protect, BookingController.getTheaterBookings);
router.patch('/statusChange/:bookingId', AdminAuthMiddleware.protect, BookingController.updateBookingStatus);

router.get('/get-theaterOwners',AdminAuthMiddleware.protect, TheaterController.getTheaterOwners);

router.get('/chatrooms/:adminId',AdminAuthMiddleware.protect, ChatController.getAdminChatRooms); 
router.route('/chatrooms/:chatRoomId/messages').get(AdminAuthMiddleware.protect, ChatController.getAdminMessages).post(TheaterMulterConfig.multerUploadChatImages.single('file'),AdminAuthMiddleware.protect, ChatController.sendAdminMessages); 
router.route('/mark-messages-read').post(AdminAuthMiddleware.protect, ChatController.markAdminMessagesAsRead); 
router.get('/notifications/unread',AdminAuthMiddleware.protect, ChatController.getAdminUnreadMessages); 
router.put('/notifications/:id/read',AdminAuthMiddleware.protect, ChatController.markAdminMessagesAsRead); 


router.post('/admin-logout', AdminController.adminLogout);
 
export default router;
