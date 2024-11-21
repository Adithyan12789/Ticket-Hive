import { Booking, IBooking } from "../Models/bookingModel";
import User, { IUser } from "../Models/UserModel";

class BookingRepository {

  public async findAllBookings(): Promise<any[]> {
    return await Booking.find({})
      .populate("user", "name email") // Populate user details
      .populate("movie theater screen") // Populate other relevant fields
      .lean();
  }
  
  // Find a user by their ID
  public async findUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  // Find bookings for a specific user
  public async findBookingsByUserId(userId: string): Promise<any[]> {
    return await Booking.find({ user: userId }).populate("movie theater screen").lean();
  }

  // Find a specific booking by its ID
  public async findBookingById(bookingId: string): Promise<any | null> {
    return await Booking.findById(bookingId).populate("movie theater screen");
  }


  // Delete a booking by its ID
  public async deleteBookingById(bookingId: string): Promise<any | null> {
    return await Booking.findByIdAndDelete(bookingId);
  }

  public async createBooking(data: Partial<IBooking>) {
    return await Booking.create(data);
  }

  public async updateBookingStatus(bookingId: string, status: string) {
    try {
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: bookingId },
        { paymentStatus: status },
        { new: true } // Return the updated booking object
      ).exec();

      console.log("repo updatedBooking: ", updatedBooking);
      

      return updatedBooking;
    } catch (error: any) {
      console.error("Error updating booking status:", error.message);
      throw new Error("Error updating booking status");
    }
  }

  // Update a booking by its ID
  public async updateBooking(bookingId: string, updatedData: Partial<typeof Booking>) {
    return await Booking.findByIdAndUpdate(bookingId, updatedData, { new: true });
  }

  public async getUserBookings(userId: string): Promise<any[]> {
    return await this.findBookingsByUserId(userId); // Reuse the existing method
  }

  // Get bookings for a specific theater
  public async getTheaterBookings(theaterId: string) {
    return await Booking.find({ theater: theaterId })
      .populate("user", "name email")
      .populate("movie", "title")
      .populate("screen", "screenName");
  }
}

export default new BookingRepository();
