import { getAuth } from "@clerk/express";
import { ApiError } from "../utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const auth = getAuth(req);
  const { userId } = auth;
  if (!userId) {
    return next(new ApiError(401, "User not logged in!"));
  }
  next();
};

export const getDbUserFromReq = async (req: Request) => {
  const auth = getAuth(req);
  const { userId } = auth;
  if (!userId) {
    throw new ApiError(401, "User not logged in!");
  }

  const user = await User.findOne({ clerkUserId: userId });
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  return user;
};

export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const extractCurrentUser = await getDbUserFromReq(req);

    if (extractCurrentUser.role !== "ADMIN") {
      throw new ApiError(403, "Unauthorized! Admin access only!");
    }
    next();
  },
);
