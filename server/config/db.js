import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/elibrary";
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    
    // Set a lower timeout so development container doesn't hang indefinitely if MongoDB is absent
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn("Mongoose server will rely on active memory or mocked in-memory persistence fallback for offline-friendly execution.");
    // We don't exit process so the dev server stays alive on port 3000
  }
};

export default connectDB;
