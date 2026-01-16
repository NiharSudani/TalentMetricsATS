import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service.js';

export const uploadController = {
  async uploadResume(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await uploadService.uploadResume(req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async bulkUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await uploadService.bulkUpload(req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
};
