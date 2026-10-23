const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_TYPES = new Map([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/gif', ['.gif']],
  ['image/webp', ['.webp']],
  ['application/pdf', ['.pdf']],
  ['video/mp4', ['.mp4']],
  ['video/webm', ['.webm']],
  ['video/ogg', ['.ogg']],
  ['video/quicktime', ['.mov']],
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();
  const allowedExtensions = ALLOWED_TYPES.get(mime);

  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    return cb(new Error('Unsupported file type. Allowed: JPG, PNG, GIF, WebP, PDF, MP4, WebM, OGG, MOV.'), false);
  }

  cb(null, true);
}

const uploadMedia = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 20 },
  fileFilter,
});

module.exports = uploadMedia;
