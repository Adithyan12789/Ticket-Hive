import { Schema, model, Document, Types } from "mongoose";

export interface IMovie extends Document {
  title: string;
  genres: string[];
  duration: string;
  description: string;
  languages: string[];
  images: string[];
  casts: string[];
  castsImages: string[];
  director: string;
  releaseDate: Date;
  posters: string | null;
}

const MovieSchema = new Schema<IMovie>({
  title: { type: String, required: true },
  genres: { type: [String], required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
  languages: { type: [String], required: true },
  images: { type: [String], required: true, default: [] },
  casts: { type: [String], required: true },
  castsImages: { type: [String], required: true, default: [] },
  director: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  posters: { type: String, required: true }
});

export const Movie = model<IMovie>("Movie", MovieSchema);
