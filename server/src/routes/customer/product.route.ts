import { Router } from "express";
import { ok } from "../../utils/envelope.js";
import { requireFound } from "../../utils/helper.js";
import { Product } from "../../models/product.model.js";
import { Request, Response, NextFunction } from "express";
import { Category } from "../../models/category.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const customerProductRouter = Router();

type ProductSort = "recent" | "low-to-high" | "high-to-low";

type ProductAppliedFilterListQuery = {
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  sort?: ProductSort;
};

customerProductRouter.get(
  "categories",
  asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const categories = await Category.find({}).sort({ name: 1 });

    res.json(ok(categories));
  }),
);

customerProductRouter.get(
  "products",
  asyncHandler(
    async (
      req: Request<{}, {}, {}, ProductAppliedFilterListQuery>,
      res: Response,
    ) => {
      const category = (req.query.category || "").trim();
      const brand = (req.query.brand || "").trim();
      const color = (req.query.color || "").trim();
      const size = (req.query.size || "").trim();
      const sort: ProductSort = req.query.sort || "recent";

      const query: Record<string, unknown> = {
        status: "active",
      };

      if (category) {
        query.category = category;
      }

      if (brand) {
        query.brand = brand;
      }

      if (color) {
        query.color = color;
      }

      if (size) {
        query.size = size;
      }

      let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
      if (sort === "low-to-high") {
        sortOptions = { price: 1 };
      } else if (sort === "high-to-low") {
        sortOptions = { price: -1 };
      }

      const products = await Product.find(query)
        .populate("category", "name")
        .sort(sortOptions);

      res.json(ok(products));
    },
  ),
);

customerProductRouter.get(
  "products/:id",
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id: productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    }).populate("category", "name");

    const foundProduct = requireFound(product, "Product not found", 404);

    const relatedProducts = await Product.find({
      _id: { $ne: foundProduct._id },
      category: foundProduct.category,
      status: "active",
    })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(4);

    res.json(ok({ product: foundProduct, relatedProducts }));
  }),
);
