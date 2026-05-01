import cors from "cors";
import morgan from "morgan";
import express from "express";
import { connectDB } from "./db.js";
import { ok } from "./utils/envelope.js";
import { clerkMiddleware } from "@clerk/express";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { authRouter } from "./routes/auth/auth.route.js";

import { adminPromoRouter } from "./routes/admin/promo.route.js";
import { adminOrderRouter } from "./routes/admin/orders.route.js";
import { adminProductRouter } from "./routes/admin/product.route.js";
import { adminSettingsRouter } from "./routes/admin/settings.route.js";
import { adminDashboardRouter } from "./routes/admin/dashboard.route.js";

import { customerHomeRouter } from "./routes/customer/home.route.js";
import { customerPromoRouter } from "./routes/customer/promo.route.js";
import { customerOrderRouter } from "./routes/customer/orders.route.js";
import { customerProductRouter } from "./routes/customer/product.route.js";
import { customerAddressRouter } from "./routes/customer/address.route.js";
import { customerCheckoutRouter } from "./routes/customer/checkout.route.js";
import { customerCartWishlistRouter } from "./routes/customer/cart-wishlist.route.js";
import { customerCheckoutWithPointsRouter } from "./routes/customer/checkout-with-points.js";

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

  app.use("/admin", adminPromoRouter);
  app.use("/admin", adminOrderRouter);
  app.use("/admin", adminProductRouter);
  app.use("/admin", adminSettingsRouter);
  app.use("/admin", adminDashboardRouter);

  app.use("/customer", customerHomeRouter);
  app.use("/customer", customerOrderRouter);
  app.use("/customer", customerPromoRouter);
  app.use("/customer", customerProductRouter);
  app.use("/customer", customerAddressRouter);
  app.use("/customer", customerCheckoutRouter);
  app.use("/customer", customerCartWishlistRouter);
  app.use("/customer", customerCheckoutWithPointsRouter);

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
