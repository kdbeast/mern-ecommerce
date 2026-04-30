import { Types } from "mongoose";
import {
  getDbUserFromReq,
  requireAuth,
} from "../../middleware/auth.middleware.js";
import { ok } from "../../utils/envelope.js";
import { Cart } from "../../models/cart.model.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { Promo } from "../../models/promo.model.js";
import { Order } from "../../models/order.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Router, type Request, type Response } from "express";
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
  points: number;
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

export const customerCheckoutWithPointsRouter = Router();

customerCheckoutWithPointsRouter.use(requireAuth);

customerCheckoutWithPointsRouter.get(
  "checkout/points",
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);

    const user = await User.findById(dbUser?._id)
      .select("points")
      .lean<{ points: number } | null>();

    const foundUser = requireFound(user, "User not found", 404);

    res.json(
      ok({
        points: foundUser.points || 0,
      }),
    );
  }),
);

customerCheckoutWithPointsRouter.post(
  "checkout/pay-with-points",
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

    if (totalAmount > foundUser.points) {
      throw new ApiError(400, "Not enough points to place order");
    }

    const deductedUserPoints = await User.updateOne(
      { _id: dbUser?._id, points: { $gte: totalAmount } },
      { $inc: { points: -totalAmount } },
    );

    if (!deductedUserPoints.matchedCount) {
      throw new ApiError(400, "Not enough points to place order");
    }

    try {
      for (const item of items) {
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

      if (appliedPromoCode) {
        await Promo.updateOne(
          { code: appliedPromoCode, count: { $gt: 0 } },
          { $inc: { count: -1 } },
        );
      }

      await Cart.updateOne({ user: dbUser?._id }, { $set: { items: [] } });

      const pointsPaymentId = `PP_${Date.now()}`;

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
        paymentStatus: "paid",
        orderStatus: "placed",
        razorpayOrderId: pointsPaymentId,
        paymentId: pointsPaymentId,
        paidAt: new Date(),
      });

      const updatedUser = await User.findById(dbUser?._id)
        .select("points")
        .lean<{ points: number } | null>();

      res.json(
        ok({
          order: {
            _id: String(order._id),
            totalPoints: totalAmount,
          },
        }),
      );
    } catch (error) {
      await User.updateOne(
        { _id: dbUser?._id },
        { $inc: { points: totalAmount } },
      );
      throw error;
    }
  }),
);
