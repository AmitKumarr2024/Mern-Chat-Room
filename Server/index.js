import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import mongodb from "./src/config/mongodb.js";
const port = process.env.PORT;
import UserRoute from "./src/context/Users/User_router.js";
import cookieParser from "cookie-parser";
import { app, server } from "./src/socket/index.js";

const allowedOrigins = process.env.FRONTEND_URLS.split(','); // assuming FRONTEND_URLS is comma-separated

app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);


app.use("/api/users", UserRoute);

mongodb()
  .then(() => {
    server.listen(port, () => {
      console.log("Server is running at port:", port);
    });
  })
  .catch((error) => {
    console.error("Error starting server:", error);
    process.exit(1); // Exit the process if there’s an error
  });
