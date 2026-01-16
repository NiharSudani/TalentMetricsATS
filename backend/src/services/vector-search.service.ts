/**
 * MongoDB Atlas Vector Search Service
 * Uses $vectorSearch aggregation stage for semantic similarity search
 */

import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

// MongoDB client for raw aggregation queries (Prisma doesn't support $vectorSearch yet)
let mongoClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient) {
    const mongoUrl = config.database.url;
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
  }
  return mongoClient;
}

export const vectorSearchService = {
  /**
   * Create vector search index on MongoDB Atlas
   * Run this once via MongoDB Atlas UI or CLI
   * Index definition:
   * {
   *   "fields": [
   *     {
   *       "type": "vector",
   *       "path": "embedding",
   *       "numDimensions": 384,
   *       "similarity": "cosine"
   *     }
   *   ]
   * }
   */
  
  /**
   * Search candidates by job embedding using Atlas Vector Search
   * @param jobId - Job ID to get embedding from
   * @param limit - Number of results to return
   * @returns Array of candidates with similarity scores
   */
  async searchCandidatesByJob(
    jobId: string,
    limit: number = 50
  ): Promise<Array<{ candidateId: string; similarity: number; score: number }>> {
    try {
      // Get job embedding
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { embedding: true },
      });

      if (!job || !job.embedding) {
        logger.warn(`Job ${jobId} has no embedding`);
        return [];
      }

      const client = await getMongoClient();
      const db = client.db();
      const candidatesCollection = db.collection('candidates');

      // MongoDB Atlas Vector Search aggregation
      const pipeline = [
        {
          $vectorSearch: {
            index: 'candidate_vector_index', // Must be created in Atlas UI
            path: 'embedding',
            queryVector: job.embedding,
            numCandidates: limit * 10, // Search more candidates for better results
            limit: limit,
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            skills: 1,
            experience: 1,
            certifications: 1,
            score: { $meta: 'vectorSearchScore' }, // Similarity score from Atlas
          },
        },
      ];

      const results = await candidatesCollection.aggregate(pipeline).toArray();

      return results.map((doc) => ({
        candidateId: doc._id.toString(),
        similarity: doc.score || 0,
        score: (doc.score || 0) * 100, // Convert to 0-100 scale
      }));
    } catch (error) {
      logger.error('Vector search error', { error, jobId });
      throw error;
    }
  },

  /**
   * Search jobs by candidate embedding
   * @param candidateId - Candidate ID to get embedding from
   * @param limit - Number of results to return
   */
  async searchJobsByCandidate(
    candidateId: string,
    limit: number = 20
  ): Promise<Array<{ jobId: string; similarity: number; score: number }>> {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        select: { embedding: true },
      });

      if (!candidate || !candidate.embedding) {
        logger.warn(`Candidate ${candidateId} has no embedding`);
        return [];
      }

      const client = await getMongoClient();
      const db = client.db();
      const jobsCollection = db.collection('jobs');

      const pipeline = [
        {
          $vectorSearch: {
            index: 'job_vector_index', // Must be created in Atlas UI
            path: 'embedding',
            queryVector: candidate.embedding,
            numCandidates: limit * 10,
            limit: limit,
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            status: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ];

      const results = await jobsCollection.aggregate(pipeline).toArray();

      return results.map((doc) => ({
        jobId: doc._id.toString(),
        similarity: doc.score || 0,
        score: (doc.score || 0) * 100,
      }));
    } catch (error) {
      logger.error('Vector search error', { error, candidateId });
      throw error;
    }
  },

  /**
   * Calculate skill gap using vector similarity
   * Compares candidate embedding with job embedding
   */
  async calculateSkillGap(jobId: string, candidateId: string): Promise<{
    overallSimilarity: number;
    skillMatches: Array<{ skill: string; match: boolean; similarity: number }>;
  }> {
    const [job, candidate] = await Promise.all([
      prisma.job.findUnique({ where: { id: jobId } }),
      prisma.candidate.findUnique({ where: { id: candidateId } }),
    ]);

    if (!job || !candidate || !job.embedding || !candidate.embedding) {
      throw new Error('Job or candidate missing embeddings');
    }

    // Calculate cosine similarity
    const similarity = this.cosineSimilarity(job.embedding, candidate.embedding);
    const overallSimilarity = (similarity + 1) / 2 * 100; // Normalize to 0-100

    // Match individual skills (simplified - can be enhanced with skill-specific embeddings)
    const skillMatches = job.requiredSkills.map((skill) => {
      const candidateHasSkill = candidate.skills.some((cs) =>
        cs.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(cs.toLowerCase())
      );
      return {
        skill,
        match: candidateHasSkill,
        similarity: candidateHasSkill ? 100 : 0,
      };
    });

    return {
      overallSimilarity,
      skillMatches,
    };
  },

  /**
   * Cosine similarity calculation
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  },

  /**
   * Close MongoDB connection
   */
  async close(): Promise<void> {
    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
    }
  },
};
