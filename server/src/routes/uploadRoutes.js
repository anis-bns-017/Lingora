import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all upload routes
router.use(protect);

// Single file upload
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multiple files upload
router.post('/images', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));
    
    res.json({
      success: true,
      count: files.length,
      files
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;