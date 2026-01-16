import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller.js';
import { uploadSingle, uploadMultiple } from '../middleware/multer.middleware.js';

const router = Router();

router.post('/resume', uploadSingle, uploadController.uploadResume);
router.post('/bulk', uploadMultiple, uploadController.bulkUpload);

export default router;
