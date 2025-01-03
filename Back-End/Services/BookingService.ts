import mongoose from "mongoose";
import { Booking } from "../Models/bookingModel";
import BookingRepo from "../Repositories/BookingRepo";
import WalletRepo from "../Repositories/WalletRepo";
import { ITransaction } from "../Models/WalletModel";
import { v4 as uuidv4 } from "uuid";
import { Movie } from "../Models/MoviesModel";
import { Schedule } from "../Models/ScheduleModel";
import MovieRepo from "../Repositories/MovieRepo";

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

export async function getMovieTitleById(movieId: string): Promise<string> {
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new Error("Movie not found.");
  }
  return movie.title;
}

class BookingService {
  public async createBookingService(
    movieId: string,
    scheduleId: string,
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
    formattedBookingDate: string
  ) {
    const formattedDateOnly = formattedBookingDate.split("T")[0];
    console.log("formattedDateOnly: ", formattedDateOnly);

    const startOfDay = new Date(formattedDateOnly + "T00:00:00.000Z");
    const endOfDay = new Date(formattedDateOnly + "T23:59:59.999Z");

    // Try to find the existing schedule based on the date and show time
    let schedule = await Schedule.findOne({
      screen: screenId,
      date: { $gte: startOfDay, $lte: endOfDay },
      "showTimes.time": showTime,
    });

    console.log("schedule: ", schedule);

    if (!schedule) {
      const existingSchedule = await Schedule.findOne({ screen: screenId });
      console.log("entered not schedule");

      if (!existingSchedule) {
        throw new Error(
          "No existing schedule found for the screen to use its layout."
        );
      }

      // Get the layout from the existing schedule
      const layoutToUse = existingSchedule.showTimes[0].layout;

      // Ensure all seats have `isAvailable` set to `true`
      const newLayout = layoutToUse.map((row) =>
        row.map((seat) => ({
          ...seat,
          isAvailable: true, // Set all seats as available
        }))
      );

      // Create the new schedule with the updated layout
      schedule = new Schedule({
        screen: screenId,
        date: formattedBookingDate,
        showTimes: [
          {
            time: showTime,
            movie: movieId,
            movieTitle: await getMovieTitleById(movieId),
            layout: newLayout, // Set the new layout with all seats available
          },
        ],
      });

      // Save the new schedule
      await schedule.save();
    }

    const targetShowTime = schedule.showTimes.find(
      (show) => show.time === showTime
    );

    if (!targetShowTime) {
      throw new Error("Show time not found in the schedule.");
    }

    // Update the layout to mark selected seats as unavailable
    targetShowTime.layout = targetShowTime.layout.map((row) =>
      row.map((seat) =>
        seatIds.includes(seat.label) ? { ...seat, isAvailable: false } : seat
      )
    );

    // Save the updated schedule
    await schedule.save();

    // Create the new booking record
    const newBooking = await BookingRepo.createBooking({
      movie: new mongoose.Types.ObjectId(movieId),
      theater: new mongoose.Types.ObjectId(theaterId),
      screen: new mongoose.Types.ObjectId(screenId),
      offer: offerId ? new mongoose.Types.ObjectId(offerId) : null,
      seats: seatIds,
      bookingDate: schedule.date,
      showTime,
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

    return newBooking;
  }

  public async getAllTicketsService(userId: string) {
    const bookings = await BookingRepo.findAllBookings(userId);

    console.log("iiiiiiiiiii bookings: ", bookings);
    

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
    // Find the booking
    const booking = await BookingRepo.findBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    // Check if the booking belongs to the user
    if (String(booking.user) !== userId) {
      throw new Error("You are not authorized to cancel this ticket");
    }

    const { seats, showTime, totalPrice, bookingDate, screen, movie } = booking;

    const movieDetails = await MovieRepo.findMovieById(movie);
    if (!movieDetails) throw new Error("Movie details not found");

    // Find the relevant schedule
    const schedule = await Schedule.findOne({
      screen: screen._id,
      date: bookingDate,
    });

    if (!schedule)
      throw new Error("Schedule not found for the specified screen and date.");

    // Find the showtime in the schedule
    const targetShowTime = schedule.showTimes.find((s) => s.time === showTime);

    if (!targetShowTime)
      throw new Error("Show time not found in the schedule.");

    // Update seat availability in the layout
    let seatFound = false;
    targetShowTime.layout = targetShowTime.layout.map((row) =>
      row.map((seat) => {
        if (seats.includes(seat.label)) {
          seatFound = true;
          return { ...seat, isAvailable: true }; // Mark the seat as available
        }
        return seat;
      })
    );

    if (!seatFound) {
      throw new Error(
        "Seats not found in the layout for the specified show time."
      );
    }

    // Save the updated schedule
    await schedule.save();

    // Update the booking status to "cancelled"
    booking.paymentStatus = "cancelled";
    await booking.save();

    // Process the wallet refund
    const wallet = await WalletRepo.findWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");

    const transaction: ITransaction = {
      transactionId: uuidv4(),
      amount: totalPrice,
      type: "credit",
      status: "success",
      date: new Date(),
      description: `Refund: "${
        movieDetails.title
      }" on ${bookingDate.toLocaleDateString()}, ${showTime}, Screen ${
        screen.screenNumber
      }, Seats: ${seats.join(", ")}`,
    };

    wallet.transactions.push(transaction);
    wallet.balance += totalPrice;

    await wallet.save();

    return { message: "Booking canceled successfully", booking };
  }

  public async getTicketDetails(ticketId: string) {
    const ticket = await BookingRepo.findTicketById(ticketId);
    if (!ticket) throw new Error("Ticket not found");
    return ticket;
  }  
  
  public async getBookingDetails(bookingId: string) {
    const booking = await BookingRepo.findBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");
    return booking;
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
