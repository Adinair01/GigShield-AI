import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Default to localhost for local dev; Docker compose sets MONGO_URI to "mongo"
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/earnshield_dev";

mongoose
  .connect(MONGO_URI, {
    dbName: process.env.MONGO_DB || "earnshield_dev",
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error", err.message);
    process.exit(1);
  });

export default mongoose;

