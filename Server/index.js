import express from "express";
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = process.env.PORT;


app.get("/", (req, res) => {
  return res.status(200).send(`<H1>Hello Amit </H1>`);
});

app.listen(port,()=>{
    console.log("Server is running at port:",port);
    
})