import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import bookingService from "../Services/BookingService";
import { parse, format } from "date-fns";
import BookingService from "../Services/BookingService";
import { Movie } from "../Models/MoviesModel";
import { CustomRequest } from "../Middlewares/AuthMiddleware";
import WalletService from "../Services/WalletService";
import WalletRepo from "../Repositories/WalletRepo";
import { Offer } from "../Models/OffersModel";

class BookingController {
  // Controller to create booking
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
        movieId
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
        if (paymentMethod === "wallet") {
          const walletBalance = await WalletService.getWalletBalance(userId);
          if (walletBalance < totalPrice) {
            res.status(400).json({ message: "Insufficient wallet balance" });
            return;
          }

          const description = "Ticket booking payment";
          await WalletService.deductAmountFromWallet(
            userId,
            totalPrice,
            description
          );
        }

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
          bookingDate
        );

        if (paymentMethod === "wallet") {
          const cashbackPercentage = 10;
          const cashbackAmount = (totalPrice * cashbackPercentage) / 100;

          await WalletService.addCashbackToWallet(
            userId,
            cashbackAmount,
            `Cashback for ticket booking`
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

  getAllTickets = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const tickets = await BookingService.getAllTicketsService();

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

  getTicketDetails = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { ticketId } = req.params;
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
