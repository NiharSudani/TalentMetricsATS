import { Request, Response, NextFunction } from 'express';
import { pipelineService } from '../services/pipeline.service.js';

export const pipelineController = {
  async getPipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const pipeline = await pipelineService.getPipeline(req.params.jobId);
      res.json(pipeline);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await pipelineService.updateStatus(
        req.params.applicationId,
        req.body.status
      );
      res.json(application);
    } catch (error) {
      next(error);
    }
  },

  async moveApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await pipelineService.moveApplication(
        req.params.applicationId,
        req.body.newStatus,
        req.body.newPosition
      );
      res.json(application);
    } catch (error) {
      next(error);
    }
  },
};
