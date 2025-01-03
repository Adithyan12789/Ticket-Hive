import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import bookingService, { getMovieTitleById } from "../Services/BookingService";
import { parse, format } from "date-fns";
import BookingService from "../Services/BookingService";
import { Movie } from "../Models/MoviesModel";
import { CustomRequest } from "../Middlewares/AuthMiddleware";
import WalletService from "../Services/WalletService";
import WalletRepo from "../Repositories/WalletRepo";
import { Offer } from "../Models/OffersModel";
import NotificationService from "../Services/NotificationService";

class BookingController {
  public createBooking = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const {
        userId,
        scheduleId,
        theaterId,
        seatIds,
        screenId,
        bookingDate,
        showTime,
        totalPrice,
        paymentStatus,
        paymentMethod,
        convenienceFee,
        offerId,
        movieId,
      } = req.body;

      if (
        !movieId ||
        !scheduleId ||
        !theaterId ||
        !screenId ||
        !seatIds ||
        !showTime ||
        !userId ||
        !totalPrice ||
        !paymentStatus ||
        !paymentMethod ||
        !convenienceFee ||
        !bookingDate
      ) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      try {
        const movieTitle = await getMovieTitleById(movieId);
        if (!movieTitle) {
          res.status(404).json({ message: "Movie not found" });
          return;
        }

        if (paymentMethod === "wallet") {
          const walletBalance = await WalletService.getWalletBalance(userId);
          if (walletBalance < totalPrice) {
            res.status(400).json({ message: "Insufficient wallet balance" });
            return;
          }

          const description = `Payment for booking "${movieTitle}"`;
          await WalletService.deductAmountFromWallet(
            userId,
            totalPrice,
            description
          );
        }

        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate()+ 1);
        const formattedNextDay = nextDay.toISOString();
        
        console.log(formattedNextDay);

        const booking = await BookingService.createBookingService(
          movieId,
          scheduleId,
          theaterId,
          screenId,
          seatIds,
          userId,
          offerId,
          totalPrice,
          showTime,
          paymentStatus,
          paymentMethod,
          convenienceFee,
          formattedNextDay
        );

        await NotificationService.addNotification(
          userId,
          `Your ticket for the movie "${movieTitle}" has been booked successfully.`
        );

        if (paymentMethod === "wallet") {
          const cashbackPercentage = 10;
          const cashbackAmount = (totalPrice * cashbackPercentage) / 100;

          await WalletService.addCashbackToWallet(
            userId,
            cashbackAmount,
            `Cashback for booking "${movieTitle}"`
          );

          await NotificationService.addNotification(
            userId,
            `You've received a cashback of ₹${cashbackAmount.toFixed(
              2
            )} for your booking of "${movieTitle}".`
          );
        }

        res.status(201).json({
          message: "Booking successful",
          booking,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          res.status(500).json({
            message: "An error occurred during booking",
            error: err.message,
          });
        } else {
          res.status(500).json({ message: "An unexpected error occurred" });
        }
      }
    }
  );

  getUnreadNotifications = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      try {
        const userId = req.user?._id;

        console.log("getUnreadNotifications userId: ", userId);

        if (!userId) {
          res.status(400).json({ message: "User ID is required" });
          return;
        }

        const notifications = await NotificationService.getUnreadNotifications(
          userId
        );

        console.log("notifications: ", notifications);
        
        res.json(notifications);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  markNotificationAsRead = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {

      console.log("enetered mark");
      
      const { id: notificationId } = req.params;

      console.log("req.params: ", req.params);

      console.log("notificationId: ", notificationId);
      

      const userId = req.user?._id;

      try {
        if (!userId) {
          res.status(400).json({ message: "User ID is required" });
          return;
        }

        const message = await NotificationService.markNotificationAsRead(
          userId,
          notificationId
        );

        res.json({ message });
      } catch (error: any) {
        res
          .status(error.statusCode || 500)
          .json({ message: error.message || "Server error" });
      }
    }
  );

  clearNotifications = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {

      const userId = req.user?._id;

      console.log("userId: ", userId);

      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      try {
        await NotificationService.deleteAllNotifications(userId);
        res.json({ message: "All notifications cleared" });
      } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
      }
    }
  );

  getAllTickets = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {

      console.log("entered getAllTickets function");
      
      try {
        const { userId } = req.params;

        console.log("hmghnjhgn userId: ", userId);
        
        if (!userId) {
          res.status(401).json({ message: "Unauthorized access" });
          return;
        }
  
        const tickets = await BookingService.getAllTicketsService(userId);

        if (!tickets || tickets.length === 0) {
          res.status(404).json({ message: "No tickets found for this user" });
          return;
        }

        const ticketsWithMovieDetails = await Promise.all(
          tickets.map(async (ticket: { movieId: string }) => {
            const movie = await Movie.findById(ticket.movieId).exec();

            return {
              ticket,
              movieDetails: movie
                ? {
                    title: movie.title,
                    poster: movie.posters,
                    duration: movie.duration,
                    genre: movie.genres,
                  }
                : null,
            };
          })
        );

        res.status(200).json({
          success: true,
          tickets: ticketsWithMovieDetails,
        });
      } catch (error: unknown) {
        res.status(500).json({
          success: false,
          message: "Failed to retrieve tickets",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  cancelTicket = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const userId = req.user?._id;

      if (!bookingId || !userId) {
        res
          .status(400)
          .json({ message: "Booking ID and User ID are required" });
        return;
      }

      try {
        const cancellationResult = await BookingService.cancelTicketService(
          bookingId,
          userId
        );

        res.status(200).json({
          success: true,
          message: "Booking canceled successfully",
          booking: cancellationResult,
        });
      } catch (error: unknown) {
        res.status(500).json({
          success: false,
          message: "Failed to cancel booking",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  getBookingDetails = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      console.log("enter getBookingDetails admin");
      
      try {
        const { bookingId } = req.params;

        console.log("admin bookingId: ", bookingId);

        const booking = await bookingService.getBookingDetails(bookingId);

        if (booking) {
          res.status(200).json(booking);
        } else {
          res.status(404).json({ message: "Booking not found" });
        }
      } catch (error: any) {
        console.error("Error fetching Booking details:", error.message);
        res.status(500).json({ message: "Failed to fetch Booking details" });
      }
    }
  );
  
  getTicketDetails = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      console.log("enter getTicketDetails admin");
      
      try {
        const { ticketId } = req.params;

        console.log("admin ticketId: ", ticketId);

        const ticket = await bookingService.getTicketDetails(ticketId);

        if (ticket) {
          res.status(200).json(ticket);
        } else {
          res.status(404).json({ message: "Ticket not found" });
        }
      } catch (error: any) {
        console.error("Error fetching ticket details:", error.message);
        res.status(500).json({ message: "Failed to fetch ticket details" });
      }
    }
  );

  updateBookingStatus = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ message: "Status is required" });
        return;
      }

      try {
        const validStatuses = ["Pending", "Confirmed", "Cancelled"];

        if (!validStatuses.includes(status)) {
          res.status(400).json({ message: "Invalid status" });
          return;
        }

        const updatedBooking = await BookingService.updateBookingStatusService(
          bookingId,
          status
        );

        if (!updatedBooking) {
          res.status(404).json({ message: "Booking not found" });
          return;
        }

        res.status(200).json({
          message: "Booking status updated successfully",
          booking: updatedBooking,
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: "Failed to update booking status",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  updateTicket = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { ticketId } = req.params;
        const updatedData = req.body;

        const updatedTicket = await bookingService.updateTicket(
          ticketId,
          updatedData
        );

        if (updatedTicket) {
          res
            .status(200)
            .json({ message: "Ticket updated successfully", updatedTicket });
        } else {
          res.status(404).json({ message: "Ticket not found" });
        }
      } catch (error: any) {
        console.error("Error updating ticket:", error.message);
        res.status(500).json({ message: "Failed to update ticket" });
      }
    }
  );

  getUserBookings = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { userId } = req.params;
        const bookings = await bookingService.getUserBookings(userId);

        res.status(200).json(bookings);
      } catch (error: any) {
        console.error("Error fetching user bookings:", error.message);
        res.status(500).json({ message: "Failed to fetch user bookings" });
      }
    }
  );

  getTheaterBookings = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { theaterId } = req.params;
        const bookings = await bookingService.getTheaterBookings(theaterId);

        res.status(200).json(bookings);
      } catch (error: any) {
        console.error("Error fetching theater bookings:", error.message);
        res.status(500).json({ message: "Failed to fetch theater bookings" });
      }
    }
  );
}

export default new BookingController();
