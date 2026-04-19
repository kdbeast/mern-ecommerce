import cors from "cors";
import morgan from "morgan";
import express from "express";
import { connectDB } from "./db.js";
import { ok } from "./utils/envelope.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { clerkMiddleware } from "@clerk/express";
import { authRouter } from "./routes/auth/auth.route.js";

const mainEntryFunction = async () => {
  await connectDB();

  const app = express();

  const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );

  // middlewares
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(clerkMiddleware());

  app.get("/health", (req, res) => {
    return res
      .status(200)
      .json(ok({ message: "Server is healthy and running in health route" }));
  });

  app.use("/auth", authRouter);

  app.use(notFound);
  app.use(errorHandler);

  const PORT = Number(process.env.PORT) || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

mainEntryFunction().catch((error) => {
  console.error("There was an error in starting the server : ", error);
  process.exit(1);
});
