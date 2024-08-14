import mongoose from "mongoose";

async function mongodb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // No need for useNewUrlParser and useUnifiedTopology
    });
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("Connected to DB");
    });

    connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if the connection fails
  }
}

export default mongodb;
