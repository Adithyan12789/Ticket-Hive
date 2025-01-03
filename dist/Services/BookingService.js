"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMovieTitleById = getMovieTitleById;
const mongoose_1 = __importDefault(require("mongoose"));
const BookingRepo_1 = __importDefault(require("../Repositories/BookingRepo"));
const WalletRepo_1 = __importDefault(require("../Repositories/WalletRepo"));
const uuid_1 = require("uuid");
const MoviesModel_1 = require("../Models/MoviesModel");
const ScheduleModel_1 = require("../Models/ScheduleModel");
const MovieRepo_1 = __importDefault(require("../Repositories/MovieRepo"));
async function getMovieTitleById(movieId) {
    const movie = await MoviesModel_1.Movie.findById(movieId);
    if (!movie) {
        throw new Error("Movie not found.");
    }
    return movie.title;
}
class BookingService {
    constructor() {
        this.updateBookingStatusService = async (bookingId, status) => {
            try {
                const updatedBooking = await BookingRepo_1.default.updateBookingStatus(bookingId, status);
                return updatedBooking;
            }
            catch (error) {
                throw new Error("Error updating booking status");
            }
        };
    }
    async createBookingService(movieId, scheduleId, theaterId, screenId, seatIds, userId, offerId, totalPrice, showTime, paymentStatus, paymentMethod, convenienceFee, formattedBookingDate) {
        const formattedDateOnly = formattedBookingDate.split("T")[0];
        console.log("formattedDateOnly: ", formattedDateOnly);
        const startOfDay = new Date(formattedDateOnly + "T00:00:00.000Z");
        const endOfDay = new Date(formattedDateOnly + "T23:59:59.999Z");
        // Try to find the existing schedule based on the date and show time
        let schedule = await ScheduleModel_1.Schedule.findOne({
            screen: screenId,
            date: { $gte: startOfDay, $lte: endOfDay },
            "showTimes.time": showTime,
        });
        console.log("schedule: ", schedule);
        if (!schedule) {
            const existingSchedule = await ScheduleModel_1.Schedule.findOne({ screen: screenId });
            console.log("entered not schedule");
            if (!existingSchedule) {
                throw new Error("No existing schedule found for the screen to use its layout.");
            }
            // Get the layout from the existing schedule
            const layoutToUse = existingSchedule.showTimes[0].layout;
            // Ensure all seats have `isAvailable` set to `true`
            const newLayout = layoutToUse.map((row) => row.map((seat) => ({
                ...seat,
                isAvailable: true, // Set all seats as available
            })));
            // Create the new schedule with the updated layout
            schedule = new ScheduleModel_1.Schedule({
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
        const targetShowTime = schedule.showTimes.find((show) => show.time === showTime);
        if (!targetShowTime) {
            throw new Error("Show time not found in the schedule.");
        }
        // Update the layout to mark selected seats as unavailable
        targetShowTime.layout = targetShowTime.layout.map((row) => row.map((seat) => seatIds.includes(seat.label) ? { ...seat, isAvailable: false } : seat));
        // Save the updated schedule
        await schedule.save();
        // Create the new booking record
        const newBooking = await BookingRepo_1.default.createBooking({
            movie: new mongoose_1.default.Types.ObjectId(movieId),
            theater: new mongoose_1.default.Types.ObjectId(theaterId),
            screen: new mongoose_1.default.Types.ObjectId(screenId),
            offer: offerId ? new mongoose_1.default.Types.ObjectId(offerId) : null,
            seats: seatIds,
            bookingDate: schedule.date,
            showTime,
            paymentStatus: paymentStatus,
            paymentMethod: paymentMethod || "default",
            convenienceFee,
            user: new mongoose_1.default.Types.ObjectId(userId),
            totalPrice,
        });
        return newBooking;
    }
    async getAllTicketsService(userId) {
        const bookings = await BookingRepo_1.default.findAllBookings(userId);
        console.log("iiiiiiiiiii bookings: ", bookings);
        if (!bookings.length)
            throw new Error("No tickets found");
        return bookings.map((booking) => ({
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
    async cancelTicketService(bookingId, userId) {
        // Find the booking
        const booking = await BookingRepo_1.default.findBookingById(bookingId);
        if (!booking)
            throw new Error("Booking not found");
        // Check if the booking belongs to the user
        if (String(booking.user) !== userId) {
            throw new Error("You are not authorized to cancel this ticket");
        }
        const { seats, showTime, totalPrice, bookingDate, screen, movie } = booking;
        const movieDetails = await MovieRepo_1.default.findMovieById(movie);
        if (!movieDetails)
            throw new Error("Movie details not found");
        // Find the relevant schedule
        const schedule = await ScheduleModel_1.Schedule.findOne({
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
        targetShowTime.layout = targetShowTime.layout.map((row) => row.map((seat) => {
            if (seats.includes(seat.label)) {
                seatFound = true;
                return { ...seat, isAvailable: true }; // Mark the seat as available
            }
            return seat;
        }));
        if (!seatFound) {
            throw new Error("Seats not found in the layout for the specified show time.");
        }
        // Save the updated schedule
        await schedule.save();
        // Update the booking status to "cancelled"
        booking.paymentStatus = "cancelled";
        await booking.save();
        // Process the wallet refund
        const wallet = await WalletRepo_1.default.findWalletByUserId(userId);
        if (!wallet)
            throw new Error("Wallet not found");
        const transaction = {
            transactionId: (0, uuid_1.v4)(),
            amount: totalPrice,
            type: "credit",
            status: "success",
            date: new Date(),
            description: `Refund: "${movieDetails.title}" on ${bookingDate.toLocaleDateString()}, ${showTime}, Screen ${screen.screenNumber}, Seats: ${seats.join(", ")}`,
        };
        wallet.transactions.push(transaction);
        wallet.balance += totalPrice;
        await wallet.save();
        return { message: "Booking canceled successfully", booking };
    }
    async getTicketDetails(ticketId) {
        const ticket = await BookingRepo_1.default.findBookingById(ticketId);
        if (!ticket)
            throw new Error("Ticket not found");
        return ticket;
    }
    async updateTicket(ticketId, updatedData) {
        const updatedTicket = await BookingRepo_1.default.updateBooking(ticketId, updatedData);
        if (!updatedTicket)
            throw new Error("Failed to update ticket");
        return updatedTicket;
    }
    async getUserBookings(userId) {
        try {
            return await BookingRepo_1.default.getUserBookings(userId);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error in service while fetching user bookings: ${error.message}`);
            }
            else {
                throw new Error("An unknown error occurred while fetching user bookings.");
            }
        }
    }
    async getTheaterBookings(theaterId) {
        return await BookingRepo_1.default.getTheaterBookings(theaterId);
    }
}
exports.default = new BookingService();
