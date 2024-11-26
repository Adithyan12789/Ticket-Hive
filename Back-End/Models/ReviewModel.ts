import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId;
  movie: Types.ObjectId;
  rating: number;
  comment: string;
  likes?: number;
  dislikes?: number;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    comment: { type: String, required: false },
    likes: { type: Number, default: 0 }, // Initialize likes with default value of 0
    dislikes: { type: Number, default: 0 }, // Initialize dislikes with default value of 0
    createdAt: { type: Date, default: Date.now },
  },  
  { timestamps: true }
);

export const Review = model<IReview>("Review", ReviewSchema);
