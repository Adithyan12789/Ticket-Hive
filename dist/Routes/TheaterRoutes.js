"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TheaterController_1 = __importDefault(require("../Controllers/TheaterController"));
const ScreenController_1 = __importDefault(require("../Controllers/ScreenController"));
const TheaterAuthMiddleware_1 = require("../Middlewares/TheaterAuthMiddleware");
const TheaterMulter_1 = __importDefault(require("../Config/Multer/TheaterMulter"));
const MovieController_1 = __importDefault(require("../Controllers/MovieController"));
const OffersController_1 = __importDefault(require("../Controllers/OffersController"));
const ChatController_1 = __importDefault(require("../Controllers/ChatController"));
const AdminController_1 = __importDefault(require("../Controllers/AdminController"));
const router = express_1.default.Router();
router.post('/theater-login', TheaterController_1.default.authTheaterOwner);
router.post('/theater-GoogleLogin', TheaterController_1.default.googleLoginTheaterOwner);
router.post('/theater-signup', TheaterController_1.default.registerTheaterOwner);
router.post('/theater-verifyotp', TheaterController_1.default.verifyTheaterOwnerOTP);
router.post('/theater-resend-otp', TheaterController_1.default.resendTheaterOwnerOtp);
router.post('/theater-forgot-password', TheaterController_1.default.forgotTheaterOwnerPassword);
router.put('/theater-reset-password/:token', TheaterController_1.default.resetTheaterOwnerPassword);
router.get('/stats/:ownerId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterController_1.default.getStatsController);
router.route('/theater-profile')
    .get(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterController_1.default.getTheaterProfile)
    .put(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterMulter_1.default.multerUploadTheaterProfile.single('profileImage'), TheaterController_1.default.updateTheaterProfile);
router.post('/upload-certificate/:theaterId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterMulter_1.default.multerUploadCertificates.single('certificate'), TheaterController_1.default.uploadVerificationDetailsHandler);
router.post("/add-theaters", TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterMulter_1.default.multerUploadTheaterImages.array("images", 3), TheaterController_1.default.addTheaterController);
router.get('/get-theaters', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterController_1.default.getTheaters);
router.route('/theaters/:id')
    .get(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterController_1.default.getTheaterByIdHandler)
    .put(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterMulter_1.default.multerUploadTheaterImages.array("images", 3), TheaterController_1.default.updateTheaterHandler)
    .delete(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, TheaterController_1.default.deleteTheaterHandler);
router.post('/add-screen/:theaterId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ScreenController_1.default.addScreen);
router.put('/update-screen/:screenId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ScreenController_1.default.updateScreen);
router.delete('/delete-screen/:screenId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ScreenController_1.default.deleteScreen);
router.get('/theaters/:id/screens', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ScreenController_1.default.getScreensByTheaterId);
router.get('/screen/:screenId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ScreenController_1.default.getScreensById);
router.get('/get-movies', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, MovieController_1.default.getAllMoviesController);
router.post('/add-offer', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, OffersController_1.default.addOfferController);
router.put('/update-offer/:offerId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, OffersController_1.default.updateOfferController);
router.delete('/delete-offer/:offerId', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, OffersController_1.default.deleteOfferController);
router.get('/get-offers', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, OffersController_1.default.getOffersController);
router.get('/getAlltickets', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, AdminController_1.default.getAllTickets);
router.get('/get-admins', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, AdminController_1.default.getAdmins);
router.route('/chatrooms').get(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ChatController_1.default.getChatRooms).post(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ChatController_1.default.createChatRoom);
router.route('/chatrooms/:chatRoomId/messages').get(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ChatController_1.default.getMessages).post(TheaterMulter_1.default.multerUploadChatFiles.single('file'), TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ChatController_1.default.sendMessage);
router.get('/unread-messages', TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ChatController_1.default.getUnreadMessages);
router.route('/mark-messages-read').post(TheaterAuthMiddleware_1.TheaterAuthMiddleware.protect, ChatController_1.default.markMessagesAsRead);
router.post('/theater-logout', TheaterController_1.default.logoutTheaterOwner);
exports.default = router;
