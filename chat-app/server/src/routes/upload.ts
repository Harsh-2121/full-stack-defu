import express from 'express';
import { requireAuth } from '../config/auth';
import { upload } from '../config/upload';
import path from 'path';

const router = express.Router();

router.use(requireAuth);

// Upload single file
router.post('/file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload multiple files
router.post('/files', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({ files });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Serve uploaded files
router.use('/files', express.static(path.join(__dirname, '../../uploads')));

export default router;
