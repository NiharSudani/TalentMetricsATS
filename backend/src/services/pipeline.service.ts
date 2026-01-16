import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware.js';

const prisma = new PrismaClient();

export const pipelineService = {
  async getPipeline(jobId: string) {
    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by status
    const pipeline = {
      APPLIED: applications.filter((a) => a.status === 'APPLIED'),
      SCREENING: applications.filter((a) => a.status === 'SCREENING'),
      INTERVIEW: applications.filter((a) => a.status === 'INTERVIEW'),
      OFFERED: applications.filter((a) => a.status === 'OFFERED'),
      HIRED: applications.filter((a) => a.status === 'HIRED'),
      REJECTED: applications.filter((a) => a.status === 'REJECTED'),
    };

    return pipeline;
  },

  async updateStatus(applicationId: string, status: string) {
    return prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status as any,
      },
    });
  },

  async moveApplication(applicationId: string, newStatus: string, newPosition?: number) {
    return prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus as any,
      },
    });
  },
};
