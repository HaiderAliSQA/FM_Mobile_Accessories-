// backend/src/routes/upload.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { cloudinary } from '../config/cloudinary';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Multer memory storage — files stored in RAM before Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp', 
    'image/avif', 
    'image/heic', 
    'image/heif',
    'application/octet-stream' // Allow generic binary stream (fallback)
  ];

  // Extension check (lowercase)
  const allowedExtensions = /\.(jpg|jpeg|png|webp|avif|heic|heif)$/i;
  const hasValidExtension = allowedExtensions.test(file.originalname);

  if (allowedMimeTypes.includes(file.mimetype) || hasValidExtension) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, AVIF, HEIC`));
  }
};

const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
}).single('image');

const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per image
}).array('images', 8);

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (
  buffer: Buffer,
  originalName: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'fmmobile/products',
        resource_type: 'image',
        transformation: [
          { width: 900, height: 900, crop: 'limit', quality: 'auto:best', fetch_format: 'auto' }
        ],
        eager: [
          { width: 400, height: 400, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          { width: 120, height: 120, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
        eager_async: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed'));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    uploadStream.end(buffer);
  });
};

// POST /api/upload/image - ADMIN ONLY — single image
router.post('/image', authMiddleware, (req: Request, res: Response): void => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err instanceof multer.MulterError
          ? `Upload error: ${err.message}`
          : err.message,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    try {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

      res.status(200).json({
        success: true,
        data: { url: result.url, publicId: result.publicId },
      });
    } catch (uploadError) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload image to Cloudinary',
        error: (uploadError as Error).message,
      });
    }
  });
});

// POST /api/upload/images - ADMIN ONLY — up to 8 images at once
router.post('/images', authMiddleware, (req: Request, res: Response): void => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err instanceof multer.MulterError
          ? `Upload error: ${err.message}`
          : err.message,
      });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No files uploaded' });
      return;
    }

    try {
      console.log('Starting Cloudinary upload for', files.length, 'files...');
      const uploadPromises = files.map((file, index) => {
        console.log(`Uploading file ${index + 1}/${files.length}: ${file.originalname}`);
        return uploadToCloudinary(file.buffer, file.originalname);
      });

      const results = await Promise.all(uploadPromises);
      console.log('Successfully uploaded all files to Cloudinary');

      res.status(200).json({
        success: true,
        data: results.map((r) => ({ url: r.url, publicId: r.publicId })),
      });
    } catch (uploadError) {
      console.error('Cloudinary upload failed:', (uploadError as Error).message);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images to Cloudinary',
        error: (uploadError as Error).message,
      });
    }
  });
});

// DELETE /api/upload/:publicId - ADMIN ONLY — delete Cloudinary image
router.delete('/:publicId(*)', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPublicId = req.params['publicId'] as string;
    const publicId = decodeURIComponent(rawPublicId);

    if (!publicId) {
      res.status(400).json({ success: false, message: 'Public ID is required' });
      return;
    }

    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: (error as Error).message,
    });
  }
});

export default router;
