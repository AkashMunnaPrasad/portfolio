const supabase = require('../config/db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided.' });
  }

  const ext = path.extname(req.file.originalname);
  const fileName = `${uuidv4()}${ext}`;
  const isVideo = req.file.mimetype.startsWith('video/');
  const folder = isVideo ? 'videos' : 'images';
  const storagePath = `${folder}/${fileName}`;

  let fileBuffer;
  try {
    fileBuffer = fs.readFileSync(req.file.path);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to read file.' });
  }

  const { error: uploadError } = await supabase.storage
    .from('portfolio-images')
    .upload(storagePath, fileBuffer, { contentType: req.file.mimetype, upsert: true });

  try { fs.unlinkSync(req.file.path); } catch {}

  if (uploadError) {
    return res.status(500).json({ success: false, message: uploadError.message });
  }

  const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(storagePath);

  res.json({
    success: true,
    url: urlData.publicUrl,
    type: isVideo ? 'video' : 'image',
    filename: fileName,
  });
}

module.exports = { uploadFile };
