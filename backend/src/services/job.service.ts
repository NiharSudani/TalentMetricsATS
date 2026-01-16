import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware.js';
import axios from 'axios';
import { config } from '../config/env.js';

const prisma = new PrismaClient();

export const jobsService = {
  async getAll() {
    return prisma.job.findMany({
      include: {
        applications: {
          include: {
            candidate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            candidate: true,
          },
          orderBy: { overallScore: 'desc' },
        },
      },
    });

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    return job;
  },

  async create(data: any) {
    // Generate embedding for job description if not provided
    let embedding = data.embedding;
    if (!embedding && data.description) {
      try {
        const response = await axios.post(`${config.aiService.url}/api/job/embed`, {
          description: data.description,
        });
        embedding = response.data.embedding;
      } catch (error) {
        console.error('Failed to generate job embedding:', error);
      }
    }

    return prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        department: data.department,
        location: data.location,
        skillsWeight: data.skillsWeight ?? 0.6,
        experienceWeight: data.experienceWeight ?? 0.3,
        certsWeight: data.certsWeight ?? 0.1,
        requiredSkills: data.requiredSkills || [],
        requiredExperience: data.requiredExperience,
        requiredCerts: data.requiredCerts || [],
        embedding: embedding, // Vector embedding for Atlas Vector Search
        createdBy: data.createdBy || 'system',
        status: data.status || 'DRAFT',
      },
    });
  },

  async update(id: string, data: any) {
    // Regenerate embedding if description changed
    if (data.description) {
      try {
        const response = await axios.post(`${config.aiService.url}/api/job/embed`, {
          description: data.description,
        });
        data.embedding = response.data.embedding;
      } catch (error) {
        console.error('Failed to regenerate job embedding:', error);
      }
    }

    return prisma.job.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    await prisma.job.delete({
      where: { id },
    });
  },

  async updateStatus(id: string, status: string) {
    return prisma.job.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'CLOSED' && { closedAt: new Date() }),
      },
    });
  },
};
