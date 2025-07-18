import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(fileBuffer: Buffer, folder = 'productos-escasos') {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) return reject(error);
        resolve(result);
      }
    ).end(fileBuffer);
  });
} 