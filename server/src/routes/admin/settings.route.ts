import multer from "multer";
import { ok } from "../../utils/envelope.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { type Request, type Response, Router } from "express";
import { Banner, BannerDocument } from "../../models/banner.model.js";
import { getDbUserFromReq } from "../../middleware/auth.middleware.js";
import { uploadManyBuffersToCloudinary } from "../../utils/cloudinary.js";

type AdminBannerItem = {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  createdAt: string;
};

const mapBanner = (item: BannerDocument): AdminBannerItem => ({
  _id: String(item._id),
  imageUrl: item.imageUrl,
  imagePublicId: item.imagePublicId,
  createdAt: item.createdAt.toISOString(),
});

const BANNER_FOLDER = "ecommerce-monster-video/banners";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 5 * 1024 * 1024,
    files: 10,
  },
});

export const adminSettingsRouter = Router();

adminSettingsRouter.get(
  "/settings/banners",
  asyncHandler(async (req: Request, res: Response) => {
    const banners = await Banner.find().sort({ createdAt: -1 });

    res.json(
      ok({
        items: banners.map(mapBanner),
      }),
    );
  }),
);

adminSettingsRouter.post(
  "/settings/banners",
  upload.array("images", 10),
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = await getDbUserFromReq(req);

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0)
      throw new ApiError(400, "No files uploaded");

    const uploadedImages = await uploadManyBuffersToCloudinary(
      files.map((file) => file.buffer),
      BANNER_FOLDER,
    );

    const createFinalBanners = await Banner.insertMany(
      uploadedImages.map((image) => ({
        imageUrl: image.url,
        imagePublicId: image.publicId,
        createdBy: dbUser._id,
      })),
    );

    res.json(
      ok({
        items: createFinalBanners.map(mapBanner),
      }),
    );
  }),
);
