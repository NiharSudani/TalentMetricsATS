import { Request, Response, NextFunction } from 'express';
import { jobsService } from '../services/job.service.js';

export const jobsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await jobsService.getAll();
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobsService.getById(req.params.id);
      res.json(job);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobsService.create(req.body);
      res.status(201).json(job);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobsService.update(req.params.id, req.body);
      res.json(job);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await jobsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobsService.updateStatus(req.params.id, req.body.status);
      res.json(job);
    } catch (error) {
      next(error);
    }
  },
};
