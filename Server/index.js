import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();  // Make sure to load the environment variables before accessing them
import mongodb from "./src/config/mongodb.js";
import UserRoute from "./src/context/Users/User_router.js";
import cookieParser from "cookie-parser";
import { app, server } from "./src/socket/index.js";



app.use(express.json());
app.use(cookieParser());



// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URLS.split(','), // Split to handle multiple origins if needed
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log('Method:', req.method);
  console.log('Origin:', req.headers.origin); // Logs the origin
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  next();
});

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
