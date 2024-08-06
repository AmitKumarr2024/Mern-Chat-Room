import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import mongodb from "./src/config/mongodb.js";
const port = process.env.PORT;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  return res.status(200).send(`<H1>Hello Amit </H1>`);
});

mongodb().then(() => {
  app.listen(port, () => {
    console.log("Server is running at port:", port);
  });
});
