import { Router } from 'express';
import { pipelineController } from '../controllers/pipeline.controller.js';

const router = Router();

router.get('/:jobId', pipelineController.getPipeline);
router.patch('/:applicationId/status', pipelineController.updateStatus);
router.post('/:applicationId/move', pipelineController.moveApplication);

export default router;
