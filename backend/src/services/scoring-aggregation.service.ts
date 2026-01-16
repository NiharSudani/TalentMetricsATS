/**
 * MongoDB Aggregation Service for AI Scoring
 * Uses MongoDB aggregation pipeline with vector search and custom scoring
 */

import { MongoClient } from 'mongodb';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let mongoClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient) {
    const mongoUrl = config.database.url;
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
  }
  return mongoClient;
}

export const scoringAggregationService = {
  /**
   * Score and rank candidates for a job using MongoDB aggregation pipeline
   * Combines vector search with custom weighting from Job Architect
   */
  async scoreAndRankCandidates(jobId: string, limit: number = 50) {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job || !job.embedding) {
        throw new Error('Job not found or missing embedding');
      }

      const client = await getMongoClient();
      const db = client.db();
      const candidatesCollection = db.collection('candidates');
      const applicationsCollection = db.collection('applications');

      // MongoDB Aggregation Pipeline with Vector Search + Custom Scoring
      const pipeline = [
      // Stage 1: Vector Search (only if embedding exists)
      ...(job.embedding ? [{
        $vectorSearch: {
          index: config.mongodb.candidateVectorIndex,
          path: 'embedding',
          queryVector: job.embedding,
          numCandidates: limit * 10,
          limit: limit * 5,
        },
      }] : []),
        // Stage 2: Add vector similarity score (if from vector search)
        ...(job.embedding ? [{
          $addFields: {
            vectorSimilarity: { $meta: 'vectorSearchScore' },
          },
        }] : [{
          $addFields: {
            vectorSimilarity: 0,
          },
        }]),
        // Stage 3: Calculate skill match score (handle both string and object skills)
        {
          $addFields: {
            skillMatchScore: {
              $cond: {
                if: { $gt: [{ $size: { $ifNull: ['$skills', []] } }, 0] },
                then: {
                  $let: {
                    vars: {
                      // Extract skill names from array (handle both string and object)
                      candidateSkillNames: {
                        $map: {
                          input: { $ifNull: ['$skills', []] },
                          as: 'skill',
                          in: {
                            $cond: {
                              if: { $eq: [{ $type: '$$skill' }, 'string'] },
                              then: '$$skill',
                              else: { $ifNull: ['$$skill.name', ''] },
                            },
                          },
                        },
                      },
                    },
                    in: {
                      $multiply: [
                        {
                          $divide: [
                            {
                              $size: {
                                $setIntersection: [
                                  '$$candidateSkillNames',
                                  job.requiredSkills || [],
                                ],
                              },
                            },
                            { $max: [{ $size: job.requiredSkills || [] }, 1] },
                          ],
                        },
                        100,
                      ],
                    },
                  },
                },
                else: 0,
              },
            },
          },
        },
        // Stage 4: Calculate experience match score
        {
          $addFields: {
            experienceMatchScore: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ['$experience', null] },
                    { $ne: [job.requiredExperience, null] },
                  ],
                },
                then: {
                  $min: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            '$experience',
                            { $max: [job.requiredExperience, 1] },
                          ],
                        },
                        100,
                      ],
                    },
                    100,
                  ],
                },
                else: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ['$experience', null] },
                        { $gte: ['$experience', job.requiredExperience || 0] },
                      ],
                    },
                    then: 100,
                    else: 0,
                  },
                },
              },
            },
          },
        },
        // Stage 5: Calculate certifications match score
        {
          $addFields: {
            certsMatchScore: {
              $cond: {
                if: {
                  $gt: [{ $size: { $ifNull: ['$certifications', []] } }, 0],
                },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $size: {
                            $setIntersection: [
                              { $ifNull: ['$certifications', []] },
                              job.requiredCerts || [],
                            ],
                          },
                        },
                        { $max: [{ $size: job.requiredCerts || [] }, 1] },
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        // Stage 6: Calculate overall score using weights from Job Architect
        {
          $addFields: {
            overallScore: {
              $add: [
                {
                  $multiply: [
                    '$skillMatchScore',
                    job.skillsWeight || 0.6,
                  ],
                },
                {
                  $multiply: [
                    '$experienceMatchScore',
                    job.experienceWeight || 0.3,
                  ],
                },
                {
                  $multiply: [
                    '$certsMatchScore',
                    job.certsWeight || 0.1,
                  ],
                },
                // Add vector similarity as bonus (10% of vector score, if available)
                ...(job.embedding ? [{
                  $multiply: [
                    { $multiply: ['$vectorSimilarity', 100] },
                    0.1,
                  ],
                }] : []),
              ],
            },
            scoringBreakdown: {
              skillMatch: '$skillMatchScore',
              expMatch: '$experienceMatchScore',
              cultureMatch: { $multiply: ['$vectorSimilarity', 100] },
              vectorMatch: { $multiply: ['$vectorSimilarity', 100] },
            },
          },
        },
        // Stage 7: Sort by overall score
        {
          $sort: { overallScore: -1 },
        },
        // Stage 8: Limit results
        {
          $limit: limit,
        },
        // Stage 9: Project final fields
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            skills: 1,
            experience: 1,
            certifications: 1,
            overallScore: 1,
            skillMatchScore: 1,
            experienceMatchScore: 1,
            certsMatchScore: 1,
            vectorSimilarity: 1,
            scoringBreakdown: 1,
            pcaCoordinates: 1,
            tsneCoordinates: 1,
          },
        },
      ];

      const results = await candidatesCollection.aggregate(pipeline).toArray();

      // Create or update applications with scores
      const applications = await Promise.all(
        results.map(async (candidate) => {
          const application = await prisma.application.upsert({
            where: {
              jobId_candidateId: {
                jobId,
                candidateId: candidate._id.toString(),
              },
            },
            create: {
              jobId,
              candidateId: candidate._id.toString(),
              status: 'APPLIED',
              overallScore: candidate.overallScore,
              skillsScore: candidate.skillMatchScore,
              experienceScore: candidate.experienceMatchScore,
              certsScore: candidate.certsMatchScore,
              vectorSimilarity: candidate.vectorSimilarity,
              scoringBreakdown: candidate.scoringBreakdown,
            },
            update: {
              overallScore: candidate.overallScore,
              skillsScore: candidate.skillMatchScore,
              experienceScore: candidate.experienceMatchScore,
              certsScore: candidate.certsMatchScore,
              vectorSimilarity: candidate.vectorSimilarity,
              scoringBreakdown: candidate.scoringBreakdown,
            },
          });

          return {
            ...candidate,
            applicationId: application.id,
          };
        })
      );

      return applications;
    } catch (error) {
      logger.error('Scoring aggregation error', { error, jobId });
      throw error;
    }
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
