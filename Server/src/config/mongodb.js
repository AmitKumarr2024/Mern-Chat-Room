import mongoose from "mongoose";

async function mongodb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("Connected to DB");
    });

    connection.on("error", (error) => {  // Added error parameter here
      console.log("Something went wrong in mongodb", error);
    });
  } catch (error) {
    console.log("Something is wrong", error);
  }
}

export default mongodb;
