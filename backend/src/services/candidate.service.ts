import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware.js';

const prisma = new PrismaClient();

export const candidatesService = {
  async getAll(query: any) {
    const where: any = {};
    
    if (query.status) where.status = query.status;

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        applications: {
          include: {
            job: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return candidates;
  },

  async getById(id: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: true,
          },
        },
      },
    });

    if (!candidate) {
      throw new AppError(404, 'Candidate not found');
    }

    return candidate;
  },

  async create(data: any) {
    const candidate = await prisma.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        status: data.status || 'APPLIED',
        skills: data.skills || [],
        experience: data.experience,
        certifications: data.certifications || [],
        embedding: data.embedding, // Vector embedding from AI service
      },
    });

    // Create application if jobId provided
    if (data.jobId) {
      await prisma.application.create({
        data: {
          jobId: data.jobId,
          candidateId: candidate.id,
          status: 'APPLIED',
        },
      });
    }

    return candidate;
  },

  async update(id: string, data: any) {
    return prisma.candidate.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    await prisma.candidate.delete({
      where: { id },
    });
  },

  async getAnalysis(id: string, jobId?: string) {
    const candidate = await this.getById(id);
    
    // Get application if jobId provided
    let application = null;
    if (jobId) {
      application = await prisma.application.findUnique({
        where: {
          jobId_candidateId: {
            jobId,
            candidateId: id,
          },
        },
        include: {
          job: true,
        },
      });
    }

    return {
      candidate,
      application,
      analysis: application?.aiSummary || candidate.aiSummary || 'Analysis pending',
      scoreBreakdown: application ? {
        overall: application.overallScore,
        skills: application.skillsScore,
        experience: application.experienceScore,
        certifications: application.certsScore,
        vectorSimilarity: application.vectorSimilarity,
      } : null,
    };
  },
};
