import { Types } from "mongoose";
import {
  getDbUserFromReq,
  requireAuth,
} from "../../middleware/auth.middleware.js";
import { ok } from "../../utils/envelope.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { Product } from "../../models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Router, type Request, type Response } from "express";
import { requireFound, requireText } from "../../utils/helper.js";
import { Order, OrderStatus, PaymentStatus } from "../../models/order.model.js";

type CustomerOrderRow = {
  _id: Types.ObjectId;
  totalItems: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paidAt?: Date | null;
  deliveredAt?: Date | null;
  returnedAt?: Date | null;
  createdAt: Date;
};

export const customerOrderRouter = Router();

customerOrderRouter.use(requireAuth);

customerOrderRouter.get(
  "/orders",
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);
    const orders = await Order.find({ user: dbUser._id })
      .select(
        "totalAmount totalItems paymentStatus orderStatus paidAt deliveredAt returnedAt createdAt",
      )
      .lean<CustomerOrderRow[]>();

    res.json(
      ok({
        items: orders.map((orderItem) => ({
          _id: String(orderItem._id),
          code: String(orderItem._id).slice(-8).toUpperCase(),
          totalAmount: orderItem.totalAmount,
          totalItems: orderItem.totalItems,
          paymentStatus: orderItem.paymentStatus,
          orderStatus: orderItem.orderStatus,
          paidAt: orderItem.paidAt,
          deliveredAt: orderItem.deliveredAt,
          returnedAt: orderItem.returnedAt,
          createdAt: orderItem.createdAt,
        })),
      }),
    );
  }),
);

customerOrderRouter.patch(
  "/orders/:orderId/return",
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);
    const orderId = String(req.params.orderId || "").trim();

    requireText(orderId, "Order Id is required");

    const order = await Order.findOne({
      _id: new Types.ObjectId(orderId),
      user: dbUser._id,
    });
    const foundOrder = requireFound(order, "Order not found", 404);

    if (foundOrder.orderStatus !== "delivered" || !foundOrder.deliveredAt) {
      throw new ApiError(400, "Only delivered orders can be returned");
    }

    const sevenDaysReturnWindowTime = 7 * 24 * 60 * 60 * 1000;

    if (
      Date.now() - new Date(foundOrder.deliveredAt).getTime() >
      sevenDaysReturnWindowTime
    ) {
      throw new ApiError(400, "Return window has passed");
    }

    for (const item of foundOrder.items) {
      await Product.updateOne(
        {
          _id: item.product,
        },
        {
          $inc: {
            stock: item.quantity,
          },
        },
      );
    }

    await User.updateOne(
      {
        _id: dbUser._id,
      },
      {
        $inc: {
          points: foundOrder.totalAmount,
        },
      },
    );

    foundOrder.orderStatus = "returned";
    foundOrder.returnedAt = new Date();
    await foundOrder.save();

    res.json(
      ok({
        _id: String(foundOrder._id),
        orderStatus: foundOrder.orderStatus,
        returnedAt: foundOrder.returnedAt,
      }),
    );
  }),
);
