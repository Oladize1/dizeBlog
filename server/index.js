import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { connectDB } from "./DB/connectDB.js";
import { authRouter } from "./Routes/auth.js";
import { postRouter } from "./Routes/post.js";
import { errorHandler } from "./middleware/errorHandler.js";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
const app = express();
dotenv.config();

app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use("/api/blog", authRouter);
app.use("/api/blog/post", postRouter);

// Global error handler middleware in Express
// app.use((err, req, res, next) => {
//   return res
//     .status(404)
//     .json({ message: "Page Not Found" });
// });
app.use(errorHandler)
const PORT = process.env.PORT || 4000;
let httpServer;
const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    httpServer = app.listen(PORT, () =>
      console.log(`Server is running on port ${PORT}`),
    );
  } catch (error) {
    console.log("error", error);
    process.exit(1);
  }
};
const shutdown = async (signal) => {
  console.log(`\n Signal ${signal} recieved: starting greaceful shutdown`);
  if (httpServer) {
    await new Promise((resolve, reject) => {
      httpServer.close((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
  try {
    await mongoose.connection.close();
    console.log("database disconnect successfully");
    process.exitCode = 0;
  } catch (error) {
    process.exitCode = 1;
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", async (err) => {
  console.error("unhandled Rejection", err);
  await shutdown();
});

startServer();
