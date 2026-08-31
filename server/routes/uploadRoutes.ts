import { Router, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Single file upload endpoint
router.post('/', authenticateAdmin, upload.single('file'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided or file type rejected.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'File upload error', error: err.message });
  }
});

export default router;
