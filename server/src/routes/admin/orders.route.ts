import { Types } from "mongoose";
import { ok } from "../../utils/envelope.js";
import { ApiError } from "../../utils/ApiError.js";
import { Product } from "../../models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { type Request, type Response, Router } from "express";
import { requireFound, requireText } from "../../utils/helper.js";
import { Order, OrderStatus, PaymentStatus } from "../../models/order.model.js";

const ALLOWED_ORDER_STATUSES = [
  "placed",
  "shipped",
  "delivered",
  "returned",
] as const;

type AdminOrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];

type AdminOrderRow = {
  _id: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  totalItems: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paidAt?: Date | null;
  deliveredAt?: Date | null;
  returnedAt?: Date | null;
  createdAt: Date;
};

export const adminOrderRouter = Router();

adminOrderRouter.get(
  "/orders",
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await Order.find()
      .populate("user", "username email")
      .select(
        "customerName customerEmail totalAmount totalItems paymentStatus orderStatus paidAt deliveredAt returnedAt createdAt",
      )
      .lean<AdminOrderRow[]>();

    res.json(
      ok({
        items: orders.map((orderItem) => ({
          id: String(orderItem._id),
          code: String(orderItem._id).slice(-8).toUpperCase(),
          customerName: orderItem.customerName,
          customerEmail: orderItem.customerEmail,
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

adminOrderRouter.patch(
  "/orders/:orderI/status",
  asyncHandler(async (req: Request, res: Response) => {
    const orderId = String(req.params.orderId || "").trim();
    const orderStatus = String(
      req.body.orderStatus || "",
    ).trim() as AdminOrderStatus;

    requireText(orderId, "Order Id is required");
    requireText(orderStatus, "Order Status is required");

    if (!ALLOWED_ORDER_STATUSES.includes(orderStatus)) {
      throw new ApiError(400, "Invalid order status");
    }

    const order = await Order.findById(orderId);
    const foundOrder = requireFound(order, "Order not found", 404);

    if (orderStatus === "returned" && foundOrder.orderStatus !== "returned") {
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
    }
    if (orderStatus === "delivered" && !foundOrder.deliveredAt) {
      foundOrder.deliveredAt = new Date();
    }

    foundOrder.orderStatus = orderStatus;
    await foundOrder.save();

    res.json(
      ok({
        _id: String(foundOrder._id),
        orderStatus: foundOrder.orderStatus,
        deliveredAt: foundOrder.deliveredAt,
        returnedAt: foundOrder.returnedAt,
      }),
    );
  }),
);
