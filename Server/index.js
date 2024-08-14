import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();  // Make sure to load the environment variables before accessing them
import mongodb from "./src/config/mongodb.js";
import UserRoute from "./src/context/Users/User_router.js";
import cookieParser from "cookie-parser";
import { app, server } from "./src/socket/index.js";

// Check if FRONTEND_URLS is properly set, otherwise fallback to an empty array
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',')
  : [];

console.log("Allowed origins:", allowedOrigins);  // Debugging to check allowed origins

app.use(express.json());
app.use(cookieParser());

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,  // Allows cookies to be included in the requests
  })
);

app.use("/api/users", UserRoute);

// Connect to MongoDB and start the server
mongodb()
  .then(() => {
    const port = process.env.PORT || 5000;  // Default to port 5000 if PORT is not defined
    server.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error starting server:", error);
    process.exit(1);  // Exit the process if there’s an error
  });
