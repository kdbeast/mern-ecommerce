import { fail } from "../utils/envelope.js";
import { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json(fail(`Not Found - ${req.method}`));
};
