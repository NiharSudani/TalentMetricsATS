/**
 * Application Service
 * Manages the relationship between Jobs and Candidates
 * Handles scoring and status updates
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware.js';
import { scoringService } from './scoring.service.js';
import { vectorSearchService } from './vector-search.service.js';

const prisma = new PrismaClient();

export const applicationService = {
  /**
   * Create or update application
   */
  async createOrUpdate(jobId: string, candidateId: string, data?: any) {
    const existing = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
    });

    if (existing) {
      return prisma.application.update({
        where: { id: existing.id },
        data: {
          status: data?.status || existing.status,
          ...data,
        },
      });
    }

    return prisma.application.create({
      data: {
        jobId,
        candidateId,
        status: data?.status || 'APPLIED',
      },
    });
  },

  /**
   * Get application by ID
   */
  async getById(id: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
      },
    });

    if (!application) {
      throw new AppError(404, 'Application not found');
    }

    return application;
  },

  /**
   * Score application using AI service and vector search
   */
  async scoreApplication(applicationId: string) {
    const application = await this.getById(applicationId);

    // Calculate vector similarity
    let vectorSimilarity = null;
    try {
      const skillGap = await vectorSearchService.calculateSkillGap(
        application.jobId,
        application.candidateId
      );
      vectorSimilarity = skillGap.overallSimilarity;
    } catch (error) {
      console.error('Vector search error:', error);
    }

    // Calculate scores using AI service
    const scores = await scoringService.calculateScore(
      application.candidateId,
      application.jobId
    );

    // Update application with scores
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        overallScore: scores.overallScore,
        skillsScore: scores.skillsScore,
        experienceScore: scores.experienceScore,
        certsScore: scores.certsScore,
        vectorSimilarity,
      },
    });

    return updated;
  },

  /**
   * Update application status
   */
  async updateStatus(applicationId: string, status: string) {
    return prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status as any,
      },
    });
  },

  /**
   * Get applications for a job
   */
  async getByJobId(jobId: string, options?: { status?: string; limit?: number }) {
    const where: any = { jobId };
    if (options?.status) {
      where.status = options.status;
    }

    return prisma.application.findMany({
      where,
      include: {
        candidate: true,
      },
      orderBy: { overallScore: 'desc' },
      take: options?.limit,
    });
  },

  /**
   * Get applications for a candidate
   */
  async getByCandidateId(candidateId: string) {
    return prisma.application.findMany({
      where: { candidateId },
      include: {
        job: true,
      },
      orderBy: { overallScore: 'desc' },
    });
  },
};
