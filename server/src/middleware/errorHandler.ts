import { fail } from "../utils/envelope.js";
import { ApiError } from "../utils/ApiError.js";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(fail(err.message, "APP_ERROR"));
  }
  console.error(err);
  return res.status(500).json(fail("Internal server error", "INTERNAL_ERROR"));
};
