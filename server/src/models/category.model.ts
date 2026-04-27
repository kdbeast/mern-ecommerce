import mongoose, { HydratedDocument, Schema } from "mongoose";

export type Category = {
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryDocument = HydratedDocument<Category>;

const categorySchema = new Schema<Category>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const Category =
  mongoose.models.Category ||
  mongoose.model<Category>("Category", categorySchema);
