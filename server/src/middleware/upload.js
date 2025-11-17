import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import configureCloudinary from '../config/cloudinary.js';

let uploadInstance = null;

const getUpload = () => {
  if (!uploadInstance) {
    const cloudinary = configureCloudinary();
    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'printo-expenses',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        transformation: [{ width: 1200, crop: 'limit' }],
      },
    });

    const limits = {
      fileSize: 5 * 1024 * 1024,
    };

    const fileFilter = (req, file, cb) => {
      if (!file) {
        return cb(null, false);
      }

      const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Only JPG, PNG, or PDF files are allowed.'));
      }

      return cb(null, true);
    };

    uploadInstance = multer({ storage, limits, fileFilter });
  }
  return uploadInstance;
};

// Export middleware factory
const upload = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = getUpload();
    if (fieldName) {
      return uploadMiddleware.single(fieldName)(req, res, next);
    }
    return uploadMiddleware.any()(req, res, next);
  };
};

upload.single = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = getUpload();
    return uploadMiddleware.single(fieldName)(req, res, next);
  };
};

upload.array = (fieldName, maxCount) => {
  return (req, res, next) => {
    const uploadMiddleware = getUpload();
    return uploadMiddleware.array(fieldName, maxCount)(req, res, next);
  };
};

upload.any = () => {
  return (req, res, next) => {
    const uploadMiddleware = getUpload();
    return uploadMiddleware.any()(req, res, next);
  };
};

export default upload;

