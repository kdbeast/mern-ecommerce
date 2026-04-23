import { Router } from "express";
import { ok } from "../../utils/envelope.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { clerkClient, getAuth } from "@clerk/express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post(
  "/sync",
  requireAuth,

  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) {
      throw new ApiError(401, "User not logged in");
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const extractEmailFromUserInfo =
      clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
      ) || clerkUser.emailAddresses[0];

    const email = extractEmailFromUserInfo.emailAddress;

    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const name = fullName || clerkUser.username;

    const raw = process.env.ADMIN_EMAILS || "";

    const adminEmails = new Set(
      raw
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    );

    const existingUser = await User.findOne({ clerkUserId: userId });
    const shouldBeAdmin = email ? adminEmails.has(email.toLowerCase()) : false;

    const nextRole =
      existingUser?.role === "ADMIN"
        ? "ADMIN"
        : shouldBeAdmin
          ? "ADMIN"
          : existingUser?.role || "USER";

    const newlyCreatedDbUser = await User.findOneAndUpdate(
      { clerkUserId: userId },
      {
        clerkUserId: userId,
        name,
        email,
        role: nextRole,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.status(200).json(
      ok({
        user: {
          id: newlyCreatedDbUser._id,
          clerkUserId: newlyCreatedDbUser.clerkUserId,
          name: newlyCreatedDbUser.name,
          email: newlyCreatedDbUser.email,
          role: newlyCreatedDbUser.role,
        },
      }),
    );
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) {
      throw new ApiError(401, "User not logged in!");
    }
    const dbUser = await User.findOne({ clerkUserId: userId });
    if (!dbUser) {
      throw new ApiError(404, "User not found!");
    }

    res.status(200).json(
      ok({
        user: {
          id: dbUser._id,
          clerkUserId: dbUser.clerkUserId,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        },
      }),
    );
  }),
);
