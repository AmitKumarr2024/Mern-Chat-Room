import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import mongodb from "./src/config/mongodb.js";
const port = process.env.PORT;
import UserRoute from "./src/context/Users/User_router.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api/users", UserRoute);

mongodb().then(() => {
  app.listen(port, () => {
    console.log("Server is running at port:", port);
  });
});
