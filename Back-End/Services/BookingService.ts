import mongoose from "mongoose";
import { Booking } from "../Models/bookingModel";
import Screens from "../Models/ScreensModel";
import BookingRepo from "../Repositories/BookingRepo";

export interface BookingDetails {
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  bookingDate: Date;
  movie: any;
  screen: any;
  _id: string;
  bookingId: string;
  user: { _id: string; name: string; email: string };
  theater: { _id: string; name: string; images: string[]; address: string };
  showTime: string;
  seats: string[];
  status: "pending" | "completed" | "cancelled" | "failed";
}

class BookingService {
  public async createBookingService(
    movieId: string,
    theaterId: string,
    screenId: string,
    seatIds: string[],
    userId: string,
    totalPrice: number,
    showTime: string,
    paymentStatus: string,
    paymentMethod: string,
    convenienceFee: number,
    bookingDate: Date
  ) {
    const newBooking = await BookingRepo.createBooking({
      movie: new mongoose.Types.ObjectId(movieId),
      theater: new mongoose.Types.ObjectId(theaterId),
      screen: new mongoose.Types.ObjectId(screenId),
      seats: seatIds,
      bookingDate,
      showTime: showTime,
      paymentStatus: paymentStatus as
        | "pending"
        | "confirmed"
        | "cancelled"
        | "failed",
      paymentMethod: paymentMethod || "default",
      convenienceFee,
      user: new mongoose.Types.ObjectId(userId),
      totalPrice,
    });

    const screen = await Screens.findById(screenId);
    if (!screen) throw new Error("Screen not found");

    const show = screen.showTimes.find((s) => s.time === showTime);
    if (!show) throw new Error("Show time not found");

    show.layout = show.layout.map((row) =>
      row.map((seat) =>
        seatIds.includes(seat.label) ? { ...seat, isAvailable: false } : seat
      )
    );

    await screen.save();

    return newBooking;
  }

  public async getAllTicketsService() {
    const bookings = await BookingRepo.findAllBookings();

    if (!bookings.length) throw new Error("No tickets found");

    return bookings.map((booking: BookingDetails) => ({
      bookingId: booking._id,
      userId: booking.user._id, // Extract user details here
      userName: booking.user.name,
      userEmail: booking.user.email,
      screenId: booking.screen._id,
      movieId: booking.movie._id,
      movieTitle: booking.movie.title,
      theaterName: booking.theater.name,
      images: booking.theater.images,
      address: booking.theater.address,
      screenName: booking.screen.screenNumber,
      seats: booking.seats,
      showTime: booking.showTime,
      bookingDate: booking.bookingDate,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      totalPrice: booking.totalPrice,
    }));
  }

  public async cancelTicketService(bookingId: string, userId: string) {
    const booking = await BookingRepo.findBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (String(booking.user) !== userId) {
      throw new Error("You are not authorized to cancel this ticket");
    }

    // Assuming the booking contains the screenId, showTime, and seats array
    const { screen, seats, showTime } = booking; // Destructure to get screen, seats, and showTime
    const screenId = screen._id; // Extract screenId from screen object

    // Find the screen where the booking was made
    const screenDoc = await Screens.findById(screenId);
    if (!screenDoc) throw new Error("Screen not found");

    // Find the showTime object within the screen based on the showTime string
    const showTimeIndex = screenDoc.showTimes.findIndex(
      (s) => s.time === showTime
    );
    if (showTimeIndex === -1) throw new Error("Show time not found");

    // Find the corresponding seat labels in the layout and update them
    const showTimeDoc = screenDoc.showTimes[showTimeIndex];
    let seatFound = false;

    for (let row of showTimeDoc.layout) {
      for (let seat of row) {
        if (seats.includes(seat.label)) {
          seat.isAvailable = true; // Mark the seat as available
          seatFound = true;
        }
      }
    }

    if (!seatFound) {
      throw new Error("Seats not found in layout");
    }

    // Save the updated screen document
    await screenDoc.save();

    // Update the booking payment status
    booking.paymentStatus = "cancelled";
    await booking.save();

    return { message: "Booking canceled successfully", booking };
  }

  public async getTicketDetails(ticketId: string) {
    const ticket = await BookingRepo.findBookingById(ticketId);
    if (!ticket) throw new Error("Ticket not found");
    return ticket;
  }

  public updateBookingStatusService = async (
    bookingId: string,
    status: string
  ) => {
    try {
      const updatedBooking = await BookingRepo.updateBookingStatus(
        bookingId,
        status
      );
      console.log("service updatedBooking: ", updatedBooking);

      return updatedBooking;
    } catch (error: any) {
      throw new Error("Error updating booking status");
    }
  };

  public async updateTicket(
    ticketId: string,
    updatedData: Partial<typeof Booking>
  ) {
    const updatedTicket = await BookingRepo.updateBooking(
      ticketId,
      updatedData
    );
    if (!updatedTicket) throw new Error("Failed to update ticket");
    return updatedTicket;
  }

  public async getUserBookings(userId: string) {
    try {
      return await BookingRepo.getUserBookings(userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error in service while fetching user bookings: ${error.message}`
        );
      } else {
        throw new Error(
          "An unknown error occurred while fetching user bookings."
        );
      }
    }
  }

  public async getTheaterBookings(theaterId: string) {
    return await BookingRepo.getTheaterBookings(theaterId);
  }
}

export default new BookingService();
