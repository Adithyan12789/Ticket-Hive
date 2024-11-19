import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ShowTime {
  time: string;
  movie: mongoose.Types.ObjectId;
  movieTitle: string;
}

export interface ISeat {
  label: string;
  isAvailable: boolean;
}

export interface IShowTimeLayout {
  showTime: string; // Show time for this specific slot
  seats: ISeat[]; // Seat availability for this show time
}

export interface IScreen extends Document {
  screenNumber: number;
  capacity: number;
  theater: mongoose.Types.ObjectId;
  layout: IShowTimeLayout[]; // Store layouts for each showtime
  showTimes: ShowTime[];
  createdAt: Date;
  updatedAt: Date;
}

const ScreenSchema: Schema<IScreen> = new Schema({
  screenNumber: { type: Number, required: true, unique: true },
  capacity: { 
    type: Number, 
    required: true, 
    min: [1, 'Capacity must be at least 1'] 
  },
  theater: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TheaterDetails', 
    required: true 
  },
  layout: [
    {
      showTime: { type: String, required: true }, // The specific showtime for this layout
      seats: [
        { 
          label: { type: String, required: true },
          isAvailable: { type: Boolean, default: true } // Availability of the seat at this show time
        }
      ]
    }
  ],
  showTimes: [
    {
      time: { type: String, required: true },
      movieTitle: { type: String, required: true },
      movie: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Movie', 
        required: true 
      }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ScreenSchema.pre<IScreen>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Screens: Model<IScreen> = mongoose.model<IScreen>('Screens', ScreenSchema);

export default Screens;
