import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId; // Reference to the user who made the booking
  movie: mongoose.Types.ObjectId; // Reference to the movie being booked
  theater: mongoose.Types.ObjectId; // Reference to the theater where the movie is being shown
  screen: mongoose.Types.ObjectId; 
  seats: string[]; // Array of selected seats
  showTime: Date; // Date and time of the movie show
  totalPrice: number; // Total price for the booking
  paymentStatus: "pending" | "completed" | "failed"; // Payment status of the booking
  paymentMethod: string; // Payment method used
  convenienceFee: number; // Convenience fee applied
  bookingDate: Date; // Date when the booking was made
}

const bookingSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
  seats: { type: [String], required: true },
  bookingDate: { type: Date, required: true },
  showTime: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  convenienceFee: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});


export const Booking = model<IBooking>("Booking", bookingSchema);
