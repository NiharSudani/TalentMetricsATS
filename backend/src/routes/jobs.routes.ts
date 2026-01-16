import { Router } from 'express';
import { jobsController } from '../controllers/jobs.controller.js';

const router = Router();

router.get('/', jobsController.getAll);
router.get('/:id', jobsController.getById);
router.post('/', jobsController.create);
router.put('/:id', jobsController.update);
router.delete('/:id', jobsController.delete);
router.patch('/:id/status', jobsController.updateStatus);

export default router;
