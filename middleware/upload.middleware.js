import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { AppError } from '../utils/errorHandler.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * Upload buffer to Cloudinary. Returns URL or placeholder if Cloudinary not configured.
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'mapyournext') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Stub: return placeholder URL for dev without Cloudinary keys
    return `https://placehold.co/800x600?text=${folder}`;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(new AppError('Image upload failed', 500));
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};
