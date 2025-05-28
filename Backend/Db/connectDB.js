import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

const connectDb = async () => {
    
    if (isConnected) return;
      isConnected = true;

    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in environment variables.");
        }
         await mongoose.connect(mongoUri);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error(`Error connecting to DB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDb;
