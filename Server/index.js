import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path"; // Import path module
import mongodb from "./src/config/mongodb.js";
import UserRoute from "./src/context/Users/User_router.js";
import cookieParser from "cookie-parser";
import { app, server } from "./src/socket/index.js";

// Load environment variables
dotenv.config();

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// CORS middleware to allow frontend to access the backend
app.use(
  cors({
    origin: process.env.FRONTEND_URLS.split(","), // Split to handle multiple origins if needed
    credentials: true,
  })
);

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log("Method:", req.method);
  console.log("Origin:", req.headers.origin); // Logs the origin
  console.log("Path:", req.path);
  console.log("Headers:", req.headers);
  next();
});

// User routes
app.use("/api/users", UserRoute);

// Serve static frontend files in production
const __dirname1 = path.resolve(); // Get current directory

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/Client/dist"))); // Serve static files

  // Serve React app for any other route that doesn’t match an API route
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "Client", "dist", "index.html"));
  });
} else {
  // Fallback for development
  app.get("/", (req, res) => {
    res.send("API is Running Successfully");
  });
}

// Connect to MongoDB and start the server
mongodb()
  .then(() => {
    const port = process.env.PORT || 5000; // Default to port 5000 if PORT is not defined
    server.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error starting server:", error);
    process.exit(1); // Exit the process if there's an error
  });
