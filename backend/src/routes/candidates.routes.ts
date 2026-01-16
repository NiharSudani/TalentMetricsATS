import { Router } from 'express';
import { candidatesController } from '../controllers/candidates.controller.js';

const router = Router();

router.get('/', candidatesController.getAll);
router.get('/:id', candidatesController.getById);
router.post('/', candidatesController.create);
router.put('/:id', candidatesController.update);
router.delete('/:id', candidatesController.delete);
router.get('/:id/analysis', candidatesController.getAnalysis);
router.post('/:id/generate-insights', candidatesController.generateInsights);

export default router;
