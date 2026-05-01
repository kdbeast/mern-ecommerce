import { ok } from "../../utils/envelope.js";
import { Order } from "../../models/order.model.js";
import { Product } from "../../models/product.model.js";
import { Category } from "../../models/category.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Router, type Request, type Response } from "express";
import { requireAdmin } from "../../middleware/auth.middleware.js";

type TotalSaleRow = {
  _id: null;
  totalSales: number;
};

export const adminDashboardRouter = Router();

adminDashboardRouter.use(requireAdmin);

adminDashboardRouter.get(
  "/dashboard/lite",
  asyncHandler(async (_req: Request, res: Response) => {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalReturnedOrders,
      salesRows,
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "returned" }),
      Order.aggregate<TotalSaleRow>([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.json(
      ok({
        totalProducts,
        totalCategories,
        totalSales: salesRows[0]?.totalSales || 0,
        totalOrders,
        totalReturnedOrders,
      }),
    );
  }),
);
