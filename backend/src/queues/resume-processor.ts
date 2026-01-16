import { Queue } from 'bullmq';
import { config } from '../config/env.js';
import Redis from 'ioredis';

const redis = new Redis(config.redis.url);

export const resumeQueue = new Queue('resume-processing', {
  connection: redis,
});

export async function uploadResumeToQueue(data: {
  candidateId: string;
  jobId: string;
}) {
  await resumeQueue.add('process-resume', {
    candidateId: data.candidateId,
    jobId: data.jobId,
  });
}
