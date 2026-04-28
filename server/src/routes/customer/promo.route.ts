import { ok } from "../../utils/envelope.js";
import { ApiError } from "../../utils/ApiError.js";
import { requireText } from "../../utils/helper.js";
import { Promo } from "../../models/promo.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Router, type Request, type Response } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const customerPromoRouter = Router();

customerPromoRouter.use(requireAuth);

customerPromoRouter.post(
  "/promos/apply",
  asyncHandler(async (req: Request, res: Response) => {
    const code = String(req.body.code || "")
      .trim()
      .toUpperCase();

    const orderValue = Number(req.body.orderValue || 0);

    requireText(code, "Promo code is required");

    if (Number.isNaN(orderValue) || orderValue < 0) {
      throw new ApiError(400, "Valid order value is required!");
    }

    const promo = await Promo.findOne({ code });

    if (!promo) {
      throw new ApiError(404, "Promo not found");
    }

    const now = new Date();

    if (now < promo.startsAt) {
      throw new ApiError(400, "Promo code is not activated");
    }

    if (now > promo.endsAt) {
      throw new ApiError(400, "Promo code is expired");
    }

    if (promo.count < 1) {
      throw new ApiError(400, "Promo code limit is already excedded");
    }

    if (orderValue < promo.minimumOrderValue) {
      throw new ApiError(
        400,
        `Minimum order value for this promo is ${promo.minimumOrderValue}`,
      );
    }

    res.json(
      ok({
        code: promo.code,
        percentage: promo.percentage,
        count: promo.count,
        minimumOrderValue: promo.minimumOrderValue,
      }),
    );
  }),
);
