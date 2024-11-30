import mongoose from "mongoose";
import { Booking } from "../Models/bookingModel";
import Screens from "../Models/ScreensModel";
import BookingRepo from "../Repositories/BookingRepo";
import WalletRepo from "../Repositories/WalletRepo";
import { ITransaction } from "../Models/WalletModel";
import { v4 as uuidv4 } from "uuid";

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
    offerId: string,
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
      offer: new mongoose.Types.ObjectId(offerId),
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
      userId: booking.user._id,
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

    const { screen, seats, showTime, totalPrice } = booking;
    const screenId = screen._id;

    const screenDoc = await Screens.findById(screenId);
    if (!screenDoc) throw new Error("Screen not found");

    const showTimeIndex = screenDoc.showTimes.findIndex(
      (s) => s.time === showTime
    );
    if (showTimeIndex === -1) throw new Error("Show time not found");

    const showTimeDoc = screenDoc.showTimes[showTimeIndex];
    let seatFound = false;

    for (let row of showTimeDoc.layout) {
      for (let seat of row) {
        if (seats.includes(seat.label)) {
          seat.isAvailable = true;
          seatFound = true;
        }
      }
    }

    if (!seatFound) {
      throw new Error("Seats not found in layout");
    }

    await screenDoc.save();

    booking.paymentStatus = "cancelled";
    await booking.save();

    const wallet = await WalletRepo.findWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
  
    const transaction: ITransaction = {
      transactionId: uuidv4(),
      amount: totalPrice,
      type: "credit",
      status: "success",
      date: new Date(),
      description: `Refund for cancelled ticket`,
    };
    
    wallet.transactions.push(transaction);
    
    wallet.balance += totalPrice;
  
    await wallet.save();

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
