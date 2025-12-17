// const express = require("express");
// const dotenv = require("dotenv");
// const cookieParser = require("cookie-parser")
// const { connectDB } = require("./config/connectDB");
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";

// const routes = require("./routes/routes");
import routes from "./routes/routes.js"
import errorMiddleware  from "./middleware/errorMiddleware.js";
// const { errorMiddleware } = require("./middleware/errorMiddleware");
// const router = require("./routes/routes");

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use("/api", routes);

// app.use(errorMiddleware)



const port = process.env.APP_PORT || 8000;

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`App is running on PORT :: ${port}`);
  });
};

startServer();
