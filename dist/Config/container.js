"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const inversify_1 = require("inversify");
const AdminRepo_1 = require("../Repositories/AdminRepo");
const AdminController_1 = require("../Controllers/AdminController");
const AdminService_1 = require("../Services/AdminService");
const TheaterController_1 = require("../Controllers/TheaterController");
const TheaterService_1 = require("../Services/TheaterService");
const TheaterRepo_1 = require("../Repositories/TheaterRepo");
const UserController_1 = require("../Controllers/UserController");
const UserService_1 = require("../Services/UserService");
const UserRepo_1 = require("../Repositories/UserRepo");
const BookingController_1 = require("../Controllers/BookingController");
const BookingService_1 = require("../Services/BookingService");
const BookingRepo_1 = require("../Repositories/BookingRepo");
const NotificationService_1 = require("../Services/NotificationService");
const ChatController_1 = require("../Controllers/ChatController");
const MovieController_1 = require("../Controllers/MovieController");
const MovieService_1 = require("../Services/MovieService");
const MovieRepo_1 = __importDefault(require("../Repositories/MovieRepo"));
const ReviewController_1 = require("../Controllers/ReviewController");
const OffersController_1 = require("../Controllers/OffersController");
const OffersService_1 = require("../Services/OffersService");
const OffersRepo_1 = require("../Repositories/OffersRepo");
const WalletController_1 = require("../Controllers/WalletController");
const WalletService_1 = require("../Services/WalletService");
const WalletRepo_1 = require("../Repositories/WalletRepo");
const ScreenController_1 = require("../Controllers/ScreenController");
const ScreenRepo_1 = __importDefault(require("../Repositories/ScreenRepo"));
const ScreenService_1 = require("../Services/ScreenService");
const NotificationController_1 = require("../Controllers/NotificationController");
const ChatRepository_1 = require("../Repositories/ChatRepository");
const NotificationRepo_1 = require("../Repositories/NotificationRepo");
const ReviewRepo_1 = require("../Repositories/ReviewRepo");
const ChatService_1 = require("../Services/ChatService");
const ReviewService_1 = require("../Services/ReviewService");
const container = new inversify_1.Container();
exports.container = container;
// Admin Binding
container.bind("AdminController").to(AdminController_1.AdminController).inSingletonScope();
container.bind("IAdminService").to(AdminService_1.AdminService).inSingletonScope();
;
container.bind("IAdminRepository").to(AdminRepo_1.AdminRepository).inSingletonScope();
// Theater Binding
container.bind("TheaterController").to(TheaterController_1.TheaterController);
container.bind("ITheaterService").to(TheaterService_1.TheaterService);
container.bind("ITheaterRepository").to(TheaterRepo_1.TheaterRepository);
// User Bindings
container.bind("UserController").to(UserController_1.UserController);
container.bind("IUserService").to(UserService_1.UserService);
container.bind("IUserRepository").to(UserRepo_1.UserRepository);
// Booking Bindings
container.bind("BookingController").to(BookingController_1.BookingController);
container.bind("IBookingService").to(BookingService_1.BookingService);
container.bind("IBookingRepository").to(BookingRepo_1.BookingRepository);
// Booking Bindings
container.bind("NotificationController").to(NotificationController_1.NotificationController).inSingletonScope();
container.bind("INotificationService").to(NotificationService_1.NotificationService).inSingletonScope();
container.bind("INotificationRepository").to(NotificationRepo_1.NotificationRepository).inSingletonScope();
// ChatRoom Bindings
container.bind("ChatController").to(ChatController_1.ChatController).inSingletonScope();
container.bind("IChatService").to(ChatService_1.ChatService).inSingletonScope();
container.bind("IChatRepository").to(ChatRepository_1.ChatRepository).inSingletonScope();
// Movie Bindings
container.bind("MovieController").to(MovieController_1.MovieController).inSingletonScope();
container.bind("IMovieService").to(MovieService_1.MovieService).inSingletonScope();
container.bind("IMovieRepository").to(MovieRepo_1.default).inSingletonScope();
// Review Bindings
container.bind("ReviewController").to(ReviewController_1.ReviewController).inSingletonScope();
container.bind("IReviewService").to(ReviewService_1.ReviewService).inSingletonScope();
container.bind("IReviewRepository").to(ReviewRepo_1.ReviewRepository).inSingletonScope();
// Offer Bindings
container.bind("OfferController").to(OffersController_1.OfferController).inSingletonScope();
container.bind("IOfferService").to(OffersService_1.OfferService).inSingletonScope();
container.bind("IOfferRepository").to(OffersRepo_1.OfferRepository).inSingletonScope();
// Wallet Bindings
container.bind("WalletController").to(WalletController_1.WalletController).inSingletonScope();
container.bind("IWalletService").to(WalletService_1.WalletService).inSingletonScope();
container.bind("IWalletRepository").to(WalletRepo_1.WalletRepository).inSingletonScope();
// Screen Bindings
container.bind("ScreenController").to(ScreenController_1.ScreenController).inSingletonScope();
container.bind("IScreenService").to(ScreenService_1.ScreenService).inSingletonScope();
container.bind("IScreenRepository").to(ScreenRepo_1.default).inSingletonScope();
