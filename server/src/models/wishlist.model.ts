import mongoose, { HydratedDocument, model, Schema, Types } from "mongoose";

export type WishList = {
  user: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

export type WishListDocument = HydratedDocument<WishList>;

const WishListSchema = new Schema<WishList>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const WishList =
  mongoose.models.WishList ||
  mongoose.model<WishList>("WishList", WishListSchema);
