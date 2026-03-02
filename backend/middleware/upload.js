const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// ── Cloudinary config ──────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'itravelz',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const cloudinaryAvatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'itravelz/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

// ── Local disk fallback (used when Cloudinary env vars are missing) ──
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename:    function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images allowed (jpg, jpeg, png, webp)'), false);
  }
};

const upload = multer({
  storage: useCloudinary ? cloudinaryStorage : diskStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const avatarUpload = multer({
  storage: useCloudinary ? cloudinaryAvatarStorage : diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB for avatars
});

// ── Cloudinary video storage ───────────────────────────────────
const cloudinaryVideoStorage = useCloudinary
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder:          'itravelz/videos',
        resource_type:   'video',
        allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
      },
    })
  : null;

const diskVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const u = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'video-' + u + require('path').extname(file.originalname));
  },
});

const videoFileFilter = (req, file, cb) => {
  const allowed = /mp4|webm|mov|avi/;
  const ext = require('path').extname(file.originalname).toLowerCase().replace('.', '');
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only video files allowed (mp4, webm, mov, avi)'), false);
};

const videoUpload = multer({
  storage: useCloudinary ? cloudinaryVideoStorage : diskVideoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

module.exports = upload;
module.exports.avatarUpload = avatarUpload;
module.exports.videoUpload  = videoUpload;

