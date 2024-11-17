import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId; // Reference to the user who made the booking
  movie: mongoose.Types.ObjectId; // Reference to the movie being booked
  theater: mongoose.Types.ObjectId; // Reference to the theater where the movie is being shown
  selectedSeats: string[]; // Array of selected seats
  showTime: Date; // Date and time of the movie show
  totalPrice: number; // Total price for the booking
  paymentStatus: "pending" | "completed" | "failed"; // Payment status of the booking
  paymentMethod: string; // Payment method used
  convenienceFee: number; // Convenience fee applied
  bookingDate: Date; // Date when the booking was made
}

const BookingSchema = new Schema<IBooking>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: "TheaterDetails", required: true },
  selectedSeats: { type: [String], required: true },
  showTime: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
    required: true,
  },
  paymentMethod: { type: String, required: true },
  convenienceFee: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now, required: true },
});

export const Booking = model<IBooking>("Booking", BookingSchema);
