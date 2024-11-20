import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ShowTime {
  time: string;
  movie: mongoose.Types.ObjectId;
  movieTitle: string;
  layout: { label: string; isAvailable: boolean }[][]; 
}

export interface IScreen extends Document {
  screenNumber: number;
  capacity: number;
  theater: mongoose.Types.ObjectId;
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
  showTimes: [
    {
      time: { type: String, required: true },
      movieTitle: { type: String, required: true },
      movie: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Movie', 
        required: true 
      },
      layout: [[{ 
        label: { type: String, required: true }, 
        isAvailable: { type: Boolean, default: true } 
      }]],
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