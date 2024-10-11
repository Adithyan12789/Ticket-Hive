import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string); // Explicitly assert the type of MONGO_URI
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Type assertion for error to handle it as an Error object
        if (error instanceof Error) {
            console.log(`Error: ${error.message}`);
        } else {
            console.log(`Unexpected error: ${error}`);
        }
        process.exit(1);
    }
};

export default connectDB;
