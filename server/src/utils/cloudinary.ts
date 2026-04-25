import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";

type CloudinaryUploadResponse = {
  url: string;
  publicId: string;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadSingleBufferToCloudinary = (
  file: Buffer,
  folder = "ecommerce-monster-video/products",
): Promise<CloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            publicId: result.public_id,
          });
        }
      },
    );
    streamifier.createReadStream(file).pipe(uploadStream);
  });
};

export const uploadManyBuffersToCloudinary = async (
  files: Buffer[],
  folder = "ecommerce-monster-video/products",
): Promise<CloudinaryUploadResponse[]> => {
  return Promise.all(
    files.map((file) => uploadSingleBufferToCloudinary(file, folder)),
  );
};
