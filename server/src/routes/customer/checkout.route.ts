import { Types } from "mongoose";
import crypto from "crypto";
import {
  getDbUserFromReq,
  requireAuth,
} from "../../middleware/auth.middleware.js";
import { ok } from "../../utils/envelope.js";
import { Cart } from "../../models/cart.model.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { Promo } from "../../models/promo.model.js";
import { Order } from "../../models/Order.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Router, type Request, type Response } from "express";
import { razorpay, toSubUnits } from "../../utils/razorpay.js";
import { requireFound, requireText } from "../../utils/helper.js";
import { Product, ProductSize } from "../../models/product.model.js";

type UserAddressRow = {
  _id: Types.ObjectId;
  fullName: string;
  address: string;
  state: string;
  postalCode: string;
};

type CheckoutUserRow = {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  addresses: UserAddressRow[];
};

type CartRow = {
  items: Array<{
    product: Types.ObjectId;
    quantity: number;
    color?: string;
    size?: ProductSize;
  }>;
};

type ProductRow = {
  _id: Types.ObjectId;
  price: number;
  salePercentage: number;
  stock: number;
  status: "active" | "inactive";
};

type PromoRow = {
  code: string;
  percentage: number;
  count: number;
  minimumOrderValue: number;
  startsAt: Date;
  endsAt: Date;
};

export const customerCheckoutRouter = Router();

customerCheckoutRouter.use(requireAuth);

customerCheckoutRouter.post(
  "/checkout/create-session",
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);

    const addressId = String(req.body.addressId || "").trim();
    const promoCode = String(req.body.promoCode || "")
      .trim()
      .toUpperCase();

    requireText(addressId, "Address is required for checkout");

    const [user, cart] = await Promise.all([
      User.findById(dbUser?._id)
        .select("addresses name email")
        .lean<CheckoutUserRow>(),
      Cart.findOne({ user: dbUser?._id }).select("items").lean<CartRow>(),
    ]);

    const foundUser = requireFound(user, "User not found", 404);
    const foundCart = requireFound(cart, "Cart not found", 404);

    if (!foundCart.items.length) {
      throw new ApiError(400, "Cart is empty");
    }

    const selectedAddress = foundUser.addresses.find(
      (item) => String(item._id) === addressId,
    );

    if (!selectedAddress) {
      throw new ApiError(404, "Address not found");
    }

    const products = await Product.find({
      _id: { $in: foundCart.items.map((item) => item.product) },
    })
      .select("price salePercentage stock status")
      .lean<ProductRow[]>();

    const productsMap = new Map(products.map((p) => [String(p._id), p]));

    let totalItems = 0;
    let subTotal = 0;

    const items = foundCart.items.map((cartItem) => {
      const product = productsMap.get(String(cartItem.product));

      if (!product || product.status !== "active") {
        throw new ApiError(404, "One or more cart products are unavailable");
      }

      if (product.stock < cartItem.quantity) {
        throw new ApiError(400, "Cart items are out of stock");
      }

      const finalPrice = product.salePercentage
        ? Math.round(product.price * (1 - product.salePercentage / 100) * 100)
        : product.price;

      totalItems += cartItem.quantity;
      subTotal += finalPrice * cartItem.quantity;

      return {
        product: cartItem.product,
        quantity: cartItem.quantity,
      };
    });

    let appliedPromoCode = "";
    let discountAmount = 0;

    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode })
        .select("code percentage count minimumOrderValue startsAt endsAt")
        .lean<PromoRow | null>();

      const foundPromo = requireFound(promo, "Promo code not found", 404);

      const now = new Date();
      if (
        now < foundPromo.startsAt ||
        now > foundPromo.endsAt ||
        foundPromo.count <= 0
      ) {
        throw new ApiError(400, "Promo code is expired or exhausted");
      }

      if (subTotal < foundPromo.minimumOrderValue) {
        throw new ApiError(
          400,
          `Minimum order value not met. Minimum order value is ${foundPromo.minimumOrderValue}`,
        );
      }

      appliedPromoCode = foundPromo.code;
      discountAmount = Math.round(
        subTotal * (foundPromo.percentage / 100) * 100,
      );
    }
    const totalAmount = Math.max(subTotal - discountAmount, 0);

    const razorpayOrder = await razorpay.orders.create({
      amount: toSubUnits(totalAmount),
      currency: "INR",
      receipt: `Order_${Date.now()}`,
    });

    const deliveryAddress = [
      selectedAddress.address,
      selectedAddress.state,
      selectedAddress.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    const order = await Order.create({
      user: dbUser?._id,
      customerName: selectedAddress.fullName || foundUser.name,
      customerEmail: foundUser.email || "",
      items,
      totalItems,
      deliveryName: selectedAddress.fullName,
      deliveryAddress,
      promoCode: appliedPromoCode,
      discountAmount,
      totalAmount,
      paymentStatus: "pending",
      orderStatus: "placed",
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(200).json({
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: "INR",
      },
      order: {
        _id: order._id,
        totalItems: order.totalItems,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
      },
      message: "Order created successfully",
    });
  }),
);

customerCheckoutRouter.post(
  "/checkout/confirm",
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);
    const orderId = String(req.body.orderId || "").trim();
    const razorpayPaymentId = String(req.body.razorpay_payment_id || "").trim();
    const razorpayOrderId = String(req.body.razorpay_order_id || "").trim();
    const razorpaySignature = String(req.body.razorpay_signature || "").trim();

    requireText(orderId, "Order id is needed");
    requireText(razorpayPaymentId, "razorpayPaymentId is needed");
    requireText(razorpayOrderId, "razorpayOrderId is needed");
    requireText(razorpaySignature, "razorpaySignature is needed");

    const order = await Order.findOne({ _id: orderId, user: dbUser._id });
    const foundOrder = requireFound(order, "Order not found", 404);

    if (foundOrder.paymentStatus === "paid") {
      res.json(ok({ _id: String(foundOrder._id) }));
      return;
    }

    if (foundOrder.razorpayOrderId !== razorpayOrderId) {
      throw new ApiError(400, "Order id mismatch");
    }

    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (signature !== razorpaySignature) {
      throw new ApiError(400, "Invalid payment signature");
    }

    for (const item of foundOrder.items) {
      const updated = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
      );

      if (!updated.matchedCount) {
        throw new ApiError(400, "One or more cart items are out of stock");
      }
    }

    if (foundOrder.promoCode) {
      await Promo.updateOne(
        {
          code: foundOrder.promoCode,
          count: { $gt: 0 },
        },
        {
          $inc: { count: -1 },
        },
      );
    }

    await Cart.updateOne({ user: dbUser._id }, { $set: { items: [] } });

    foundOrder.paymentStatus = "paid";
    foundOrder.paymentId = razorpayPaymentId;
    foundOrder.paidAt = new Date();
    await foundOrder.save();

    res.json(ok({ _id: String(foundOrder._id) }));
  }),
);
