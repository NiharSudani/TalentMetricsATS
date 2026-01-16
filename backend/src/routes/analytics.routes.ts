import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/dashboard', analyticsController.getDashboard);
router.get('/ranking/:jobId', analyticsController.getRankingDashboard);
router.get('/skill-gap/:jobId', analyticsController.getSkillGap);
router.get('/funnel/:jobId', analyticsController.getFunnel);
router.get('/heatmap/:jobId', analyticsController.getHeatmap);

export default router;
