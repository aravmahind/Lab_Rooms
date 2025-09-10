import express from 'express';
const router = express.Router();
import { 
  uploadFile, 
  getRoomFiles, 
  deleteFile 
} from '../controllers/fileController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept common file types
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|md|csv|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz|js|jsx|ts|tsx|json|css|html|xml|yaml|yml/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      file.originalname.toLowerCase().split('.').pop()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('File type not allowed'));
  },
});

// Base route: /api/v1/rooms/:roomCode/files
router.route('/:roomCode/files')
  .get(protect, getRoomFiles) // Get all files for a room
  .post(protect, upload.single('file'), uploadFile); // Upload a file to a room

// Route for deleting a specific file
router.route('/:fileId')
  .delete(protect, deleteFile);

export default router;
