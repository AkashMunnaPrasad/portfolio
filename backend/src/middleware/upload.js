const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/*
 * Extension and MIME type must BOTH be allow-listed. Checking them with `||`
 * lets an attacker upload `payload.html` with an image Content-Type, which
 * would then be served as executable HTML from the API origin.
 */
const ALLOWED_TYPES = new Map([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/gif', ['.gif']],
  ['image/webp', ['.webp']],
  ['application/pdf', ['.pdf']],
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
    return cb(new Error('Unsupported file type. Allowed: JPG, PNG, GIF, WebP, PDF.'), false);
  }

  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10, fields: 40 },
  fileFilter,
});

module.exports = upload;
