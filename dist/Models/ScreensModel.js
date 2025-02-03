"use strict";
// import mongoose, { Document, Model, Schema } from 'mongoose';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Screens = void 0;
// export interface ShowTime {
//   time: string;
//   movie: mongoose.Types.ObjectId;
//   movieTitle: string;
//   layout: { label: string; isAvailable: boolean, holdSeat: boolean }[][]; 
// }
// export interface IScreen extends Document {
//   screenNumber: number;
//   capacity: number;
//   theater: mongoose.Types.ObjectId;
//   showTimes: ShowTime[];
//   createdAt: Date;
//   updatedAt: Date;
// }
// const ScreenSchema: Schema<IScreen> = new Schema({
//   screenNumber: { type: Number, required: true, unique: true },
//   capacity: { 
//     type: Number, 
//     required: true, 
//     min: [1, 'Capacity must be at least 1'] 
//   },
//   theater: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'TheaterDetails', 
//     required: true 
//   },
//   showTimes: [
//     {
//       time: { type: String, required: true },
//       movieTitle: { type: String, required: true },
//       movie: { 
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: 'Movie', 
//         required: true 
//       },
//       layout: [[{ 
//         label: { type: String, required: true }, 
//         isAvailable: { type: Boolean, default: true },
//         holdSeat: { type: Boolean, default: false } 
//       }]],
//     }
//   ],
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });
// ScreenSchema.pre<IScreen>('save', function (next) {
//   this.updatedAt = new Date();
//   next();
// });
// const Screens: Model<IScreen> = mongoose.model<IScreen>('Screens', ScreenSchema);
// export default Screens;
const mongoose_1 = __importStar(require("mongoose"));
const ScreenSchema = new mongoose_1.Schema({
    theater: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "TheaterDetails", required: true },
    schedule: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Schedule", required: false }],
    screenNumber: { type: Number, required: true },
    capacity: { type: Number, required: true },
    layout: [[{ label: { type: String, required: true } }]], // Seats layout for the screen
});
exports.Screens = mongoose_1.default.model('Screens', ScreenSchema);
