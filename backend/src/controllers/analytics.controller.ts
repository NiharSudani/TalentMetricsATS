import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';

export const analyticsController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await analyticsService.getDashboard();
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  },

  async getRankingDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const ranking = await analyticsService.getRankingDashboard(req.params.jobId);
      res.json(ranking);
    } catch (error) {
      next(error);
    }
  },

  async getSkillGap(req: Request, res: Response, next: NextFunction) {
    try {
      const skillGap = await analyticsService.getSkillGap(req.params.jobId);
      res.json(skillGap);
    } catch (error) {
      next(error);
    }
  },

  async getFunnel(req: Request, res: Response, next: NextFunction) {
    try {
      const funnel = await analyticsService.getFunnel(req.params.jobId);
      res.json(funnel);
    } catch (error) {
      next(error);
    }
  },

  async getHeatmap(req: Request, res: Response, next: NextFunction) {
    try {
      const heatmap = await analyticsService.getHeatmap(req.params.jobId);
      res.json(heatmap);
    } catch (error) {
      next(error);
    }
  },
};
