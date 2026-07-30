const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|gif|webp|svg|bmp|mp4|webm|ogg|mov|avi|mkv|pdf/i;
  const allowedMime = /image\/|video\/|application\/pdf/i;
  if (allowedExt.test(path.extname(file.originalname)) || allowedMime.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image, video, and PDF files are allowed.'), false);
  }
};

const uploadMedia = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

module.exports = uploadMedia;
