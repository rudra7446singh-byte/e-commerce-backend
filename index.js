import express from "express";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
import { connectRedis, redisClient } from "./config/redis.js";
import routes from "./routes/routes.js"
import errorMiddleware  from "./middleware/errorMiddleware.js";
import {Server} from "socket.io";
import cors from "cors";
import sockettt from "./utils/socket.js";
import { socketAuth } from "./middleware/socketAuth.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import nodeCron from "node-cron";
import User from "./models/userModel.js";
import sendEmail from "./controller/sendEmail.js"


dotenv.config();
const app = express();
app.use(
  "/api/payment",
  express.raw({ type: "application/json" })
);
app.use("/api/payment", webhookRoutes)
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// app.get("/payment/success", (req, res) => {
//   res.send("Payment successful. You can close this page.");
// });

// app.get("/payment/cancel", (req, res) => {
//   res.send("Payment cancelled.");
// });

app.use("/api", routes);

// app.use(errorMiddleware)

// (async () => {
//   await connectRedis();

//   await redisClient.set("test", "123");
//   const value = await redisClient.get("test");
//   console.log(value) 
// })();


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use(socketAuth)
sockettt(io);

app.use(errorMiddleware)

const BATCH_SIZE = 50;
const DELAY_MS = 2000;

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

nodeCron.schedule("0 7 1 * *", async () => {
  console.log("📧 Cron started");

  try {
    const users = await User.find({ isVerified: true })
      .select("email")
      .lean();

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(user =>
          sendEmail({
            to: user.email,
            subject: "tast mail send",
            html: `<p>This is your scheduled email.</p>`
          })
        )
      );
 
      console.log(`Batch ${i / BATCH_SIZE + 1} sent`);
      await sleep(DELAY_MS); 
    }

    console.log("✅ Cron finished");

  } catch (err) {
    console.error("❌ Cron failed:", err.message);
  }
});


const port = process.env.APP_PORT || 8000;

const startServer = async () => {
  await connectDB();
  server.listen(port, () => {
    console.log(`App is running on PORT :: ${port}`);
  });
};

startServer();
