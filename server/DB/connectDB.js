import mongoose from "mongoose";

export const connectDB = async (URI) => {
    try {
        const conn = await mongoose.connect(URI, {connectTimeoutMS: 20, maxConnecting: 20});
        console.log(`MongoDB connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.log(error);
        throw new Error("failed to connect to dataabase");   
    }
}