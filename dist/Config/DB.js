"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class Database {
    async connectDB() {
        try {
            const conn = await mongoose_1.default.connect(process.env.MONGO_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
            }
            else {
                console.log(`Unexpected error: ${error}`);
            }
            process.exit(1);
        }
    }
}
exports.default = new Database();
