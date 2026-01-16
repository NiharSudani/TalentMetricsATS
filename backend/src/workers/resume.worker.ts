/**
 * Resume Processing Worker
 * Processes resumes from BullMQ queue with WebSocket progress updates
 */

import { Worker, Job } from 'bullmq';
import { config } from '../config/env.js';
import Redis from 'ioredis';
import { resumeQueue } from '../queues/resume-processor.js';
import { emitUploadProgress } from '../server/websocket.js';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { encryptionService } from '../services/encryption.service.js';
import { scoringAggregationService } from '../services/scoring-aggregation.service.js';

const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);

const worker = new Worker(
  'resume-processing',
  async (job: Job) => {
    const { candidateId, jobId } = job.data;

    try {
      // Update status: PARSING
      await prisma.resumeProcessing.update({
        where: { candidateId },
        data: { status: 'PARSING', progress: 10 },
      });
      emitUploadProgress(jobId, {
        candidateId,
        status: 'PARSING',
        progress: 10,
        current: job.opts?.attemptsMade || 0,
        total: 1,
        message: 'Parsing resume...',
      });

      // Get candidate
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });

      if (!candidate) {
        throw new Error('Candidate not found');
      }

      // Update status: EMBEDDING
      await prisma.resumeProcessing.update({
        where: { candidateId },
        data: { status: 'EMBEDDING', progress: 50 },
      });
      emitUploadProgress(jobId, {
        candidateId,
        status: 'EMBEDDING',
        progress: 50,
        current: 1,
        total: 1,
        message: 'Generating embeddings...',
      });

      // Generate embedding if not exists
      if (!candidate.embedding && candidate.resumeText) {
        const decryptedText = encryptionService.decrypt(candidate.resumeText);
        const embedResponse = await axios.post(`${config.aiService.url}/api/embed`, {
          text: decryptedText,
        });

        await prisma.candidate.update({
          where: { id: candidateId },
          data: { embedding: embedResponse.data.embedding },
        });
      }

      // Update status: SCORING
      await prisma.resumeProcessing.update({
        where: { candidateId },
        data: { status: 'SCORING', progress: 80 },
      });
      emitUploadProgress(jobId, {
        candidateId,
        status: 'SCORING',
        progress: 80,
        current: 1,
        total: 1,
        message: 'Calculating scores...',
      });

      // Score candidate using aggregation service
      await scoringAggregationService.scoreAndRankCandidates(jobId, 1);

      // Update status: COMPLETED
      await prisma.resumeProcessing.update({
        where: { candidateId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
        },
      });
      emitUploadProgress(jobId, {
        candidateId,
        status: 'COMPLETED',
        progress: 100,
        current: 1,
        total: 1,
        message: 'Processing complete!',
      });

      return { success: true, candidateId };
    } catch (error: any) {
      // Update status: FAILED
      await prisma.resumeProcessing.update({
        where: { candidateId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });
      emitUploadProgress(jobId, {
        candidateId,
        status: 'FAILED',
        progress: 0,
        current: 0,
        total: 1,
        message: `Error: ${error.message}`,
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 resumes concurrently
  }
);

worker.on('completed', (job) => {
  logger.info(`Resume processing completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  logger.error(`Resume processing failed: ${job?.id}`, { error: err });
});

logger.info('Resume processing worker started');

export { worker };
