import { Request, Response, NextFunction } from 'express';
import { candidatesService } from '../services/candidate.service.js';
import axios from 'axios';
import { config } from '../config/env.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const candidatesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const candidates = await candidatesService.getAll(req.query);
      res.json(candidates);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const candidate = await candidatesService.getById(req.params.id);
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const candidate = await candidatesService.create(req.body);
      res.status(201).json(candidate);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const candidate = await candidatesService.update(req.params.id, req.body);
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await candidatesService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.query.jobId as string;
      const analysis = await candidatesService.getAnalysis(req.params.id, jobId);
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  },

  async generateInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: req.params.id },
        include: {
          applications: {
            include: {
              job: true,
            },
          },
        },
      });

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      const application = candidate.applications[0];
      if (!application) {
        return res.status(400).json({ error: 'No application found for candidate' });
      }

      // Generate AI insights using GPT-4o (or fallback to AI service)
      try {
        // Call AI service for GPT-4o summary
        const aiResponse = await axios.post(`${config.aiService.url}/api/generate-insights`, {
          candidate: {
            resumeText: candidate.resumeText,
            skills: candidate.skills,
            experience: candidate.experience,
            workHistory: candidate.workHistory,
            education: candidate.education,
          },
          job: {
            title: application.job.title,
            description: application.job.description,
            requiredSkills: application.job.requiredSkills,
          },
        });

        const insights = aiResponse.data.insights || aiResponse.data.summary;

        // Update application with insights
        await prisma.application.update({
          where: { id: application.id },
          data: { aiSummary: insights },
        });

        res.json({ insights });
      } catch (aiError) {
        // Fallback: Generate basic insights
        const basicInsights = `This candidate shows ${application.overallScore ? 'strong' : 'moderate'} alignment with the job requirements. ` +
          `Skills match: ${application.skillsScore?.toFixed(0) || 'N/A'}%, ` +
          `Experience: ${application.experienceScore?.toFixed(0) || 'N/A'}%, ` +
          `Certifications: ${application.certsScore?.toFixed(0) || 'N/A'}%. ` +
          `Vector similarity: ${application.vectorSimilarity ? (application.vectorSimilarity * 100).toFixed(0) : 'N/A'}%.`;

        res.json({ insights: basicInsights });
      }
    } catch (error) {
      next(error);
    }
  },
};
