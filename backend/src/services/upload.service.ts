import { Request } from 'express';
import { uploadResumeToQueue } from '../queues/resume-processor.js';
import { AppError } from '../middleware/error.middleware.js';
import axios from 'axios';
import { config } from '../config/env.js';
import { PrismaClient } from '@prisma/client';
import { encryptionService } from './encryption.service.js';
import FormData from 'form-data';
import { emitUploadComplete } from '../server/websocket.js';

const prisma = new PrismaClient();

export const uploadService = {
  async uploadResume(req: Request) {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    const jobId = req.body.jobId;
    if (!jobId) {
      throw new AppError(400, 'Job ID is required');
    }

    // Parse resume using AI service
    try {
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const parseResponse = await axios.post(
        `${config.aiService.url}/api/parse`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      const parsedData = parseResponse.data;

      // Encrypt resume text
      const encryptedText = encryptionService.encrypt(parsedData.text);

      // Create candidate with nested data structures
      const candidate = await prisma.candidate.create({
        data: {
          firstName: parsedData.personal_info?.name?.split(' ')[0] || 'Unknown',
          lastName: parsedData.personal_info?.name?.split(' ').slice(1).join(' ') || '',
          email: parsedData.personal_info?.email || `candidate_${Date.now()}@example.com`,
          phone: parsedData.personal_info?.phone,
          skills: parsedData.skills ? parsedData.skills.map((s: string) => ({ name: s, proficiency_score: 0.8 })) : [],
          experience: parsedData.experience,
          certifications: parsedData.certifications || [],
          education: parsedData.education,
          workHistory: parsedData.work_history,
          resumeText: encryptedText,
          embedding: parsedData.embedding, // 1536-dim vector from AI service
          status: 'APPLIED',
        },
      });

      // Create application
      await prisma.application.create({
        data: {
          jobId,
          candidateId: candidate.id,
          status: 'APPLIED',
        },
      });

      // Create processing record
      await prisma.resumeProcessing.create({
        data: {
          candidateId: candidate.id,
          status: 'PENDING',
          progress: 0,
        },
      });

      // Add to processing queue for scoring
      await uploadResumeToQueue({
        candidateId: candidate.id,
        jobId,
      });

      return {
        message: 'Resume uploaded and queued for processing',
        candidateId: candidate.id,
        jobId,
      };
    } catch (error: any) {
      throw new AppError(500, `Resume processing failed: ${error.message}`);
    }
  },

  async bulkUpload(req: Request) {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError(400, 'No files uploaded');
    }

    const jobId = req.body.jobId;
    if (!jobId) {
      throw new AppError(400, 'Job ID is required');
    }

    // Process files and queue them
    const results = [];
    let processed = 0;
    let failed = 0;

    for (const file of req.files as Express.Multer.File[]) {
      try {
        const formData = new FormData();
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });

        const parseResponse = await axios.post(
          `${config.aiService.url}/api/parse`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          }
        );

        const parsedData = parseResponse.data;
        const encryptedText = encryptionService.encrypt(parsedData.text);

        const candidate = await prisma.candidate.create({
          data: {
            firstName: parsedData.personal_info?.name?.split(' ')[0] || 'Unknown',
            lastName: parsedData.personal_info?.name?.split(' ').slice(1).join(' ') || '',
            email: parsedData.personal_info?.email || `candidate_${Date.now()}@example.com`,
            phone: parsedData.personal_info?.phone,
            skills: parsedData.skills ? parsedData.skills.map((s: string) => ({ name: s, proficiency_score: 0.8 })) : [],
            experience: parsedData.experience,
            certifications: parsedData.certifications || [],
            education: parsedData.education,
            workHistory: parsedData.work_history,
            resumeText: encryptedText,
            embedding: parsedData.embedding,
            status: 'APPLIED',
          },
        });

        await prisma.application.create({
          data: {
            jobId,
            candidateId: candidate.id,
            status: 'APPLIED',
          },
        });

        await prisma.resumeProcessing.create({
          data: {
            candidateId: candidate.id,
            status: 'PENDING',
            progress: 0,
          },
        });

        await uploadResumeToQueue({
          candidateId: candidate.id,
          jobId,
        });

        results.push({ candidateId: candidate.id, success: true });
        processed++;
      } catch (error: any) {
        results.push({ success: false, error: error.message, filename: file.originalname });
        failed++;
      }
    }

    // Emit completion event via WebSocket
    emitUploadComplete(jobId, {
      totalProcessed: processed,
      totalFailed: failed,
      results,
    });

    return {
      message: `Processed ${req.files.length} resumes`,
      jobId,
      results,
      totalProcessed: processed,
      totalFailed: failed,
    };
  },
};
