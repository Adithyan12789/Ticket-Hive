import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import bookingService from "../Services/BookingService";
import { parse, format } from "date-fns";
import BookingService from "../Services/BookingService";
import { Movie } from "../Models/MoviesModel";
import { CustomRequest } from "../Middlewares/AuthMiddleware";

class BookingController {

  createBooking = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const {
        movieId,
        theaterId,
        screenId,
        seatIds,
        showTime,
        userId,
        totalPrice,
        paymentStatus,
        paymentMethod,
        convenienceFee,
        bookingDate,
      } = req.body;

      console.log("Raw bookingDate: ", bookingDate);
      console.log("payment Method: ", paymentMethod);
      console.log("showTime: ", showTime);

      let formattedBookingDate: Date;
      try {
        const parsedDate = parse(bookingDate, "EEEE dd MMM yyyy", new Date());
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid date");
        }
        formattedBookingDate = parsedDate;
      } catch (error) {
        console.error("Error parsing bookingDate:", error);
        res.status(400).json({ message: "Invalid bookingDate format" });
        return;
      }

      console.log("Formatted bookingDate: ", formattedBookingDate);
      console.log("user id: ", userId);

      if (
        !movieId ||
        !theaterId ||
        !screenId ||
        !seatIds ||
        !showTime ||
        !userId ||
        !totalPrice ||
        !paymentStatus ||
        !convenienceFee ||
        !formattedBookingDate
      ) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      try {
        const booking = await BookingService.createBookingService(
          movieId,
          theaterId,
          screenId,
          seatIds,
          userId,
          totalPrice,
          showTime,
          paymentStatus,
          paymentMethod,
          convenienceFee,
          formattedBookingDate
        );

        console.log("controller booking: ", booking);

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
          tickets.map(async (ticket: { movieId: string; }) => {
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

      console.log("entered to cancel controller");

      const { bookingId } = req.params;
      const userId = req.user?._id;

      console.log("bookingId: ", bookingId);
      console.log("req user Id: ", req.user?._id);
      console.log("userId: ", userId);
      

      if (!bookingId || !userId) {
        res
          .status(400)
          .json({ message: "Booking ID and User ID are required" });
        return;
      }

      try {
        console.log("jjjjj");
        

        const cancellationResult = await BookingService.cancelTicketService(
          bookingId,
          userId
        );

        console.log("cancellationResult: ", cancellationResult);

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

  getTicketDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
  });

  updateBookingStatus = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      
      console.log("Request received for bookingId:", req.params.bookingId);

      const { bookingId } = req.params;
      const { status } = req.body;

      console.log("Request received with bookingId:", bookingId);
      console.log("Request body:", req.body);
      
      if (!status) {
        res.status(400).json({ message: "Status is required" });
        return;
      }

      try {
        const validStatuses = ["Pending", "Confirmed", "Cancelled"];

        console.log("validStatuses: ", validStatuses);

        if (!validStatuses.includes(status)) {
          res.status(400).json({ message: "Invalid status" });
          return;
        }

        console.log("Inside updateBookingStatusService");
        const updatedBooking = await BookingService.updateBookingStatusService(bookingId, status);
        console.log("updatedBooking", updatedBooking);        
        

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

  updateTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { ticketId } = req.params;
      const updatedData = req.body;

      const updatedTicket = await bookingService.updateTicket(ticketId, updatedData);

      if (updatedTicket) {
        res.status(200).json({ message: "Ticket updated successfully", updatedTicket });
      } else {
        res.status(404).json({ message: "Ticket not found" });
      }
    } catch (error: any) {
      console.error("Error updating ticket:", error.message);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  getUserBookings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const bookings = await bookingService.getUserBookings(userId);

      res.status(200).json(bookings);
    } catch (error: any) {
      console.error("Error fetching user bookings:", error.message);
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });

  getTheaterBookings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { theaterId } = req.params;
      const bookings = await bookingService.getTheaterBookings(theaterId);

      res.status(200).json(bookings);
    } catch (error: any) {
      console.error("Error fetching theater bookings:", error.message);
      res.status(500).json({ message: "Failed to fetch theater bookings" });
    }
  });
}

export default new BookingController();