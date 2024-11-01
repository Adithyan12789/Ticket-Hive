import mongoose, { Document, Model, Schema } from 'mongoose';

interface IScreen extends Document {
  screenNumber: number;
  capacity: number;
  theater: mongoose.Types.ObjectId; 
  layout: { label: string }[][];
  showTimes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ScreenSchema: Schema<IScreen> = new Schema({
  screenNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true, min: [1, 'Capacity must be at least 1'] },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'TheaterDetails', required: true },
  layout: [[{ label: { type: String } }]],
  showTimes: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ScreenSchema.pre<IScreen>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Screens: Model<IScreen> = mongoose.model<IScreen>('Screens', ScreenSchema);

export default Screens;
