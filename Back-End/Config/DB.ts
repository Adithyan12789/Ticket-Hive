import mongoose from "mongoose";

class Database {

    public async connectDB(): Promise<void> {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI as string);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
            } else {
                console.log(`Unexpected error: ${error}`);
            }
            process.exit(1);
        }
    }
}

export default new Database();
