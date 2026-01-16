import axios from 'axios';
import { config } from '../config/env.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Scoring Formula:
 * Score = (S_match × W_s) + (E_match × W_e) + (C_match × W_c)
 * Where:
 * - S_match = Skills match score (0-100)
 * - E_match = Experience match score (0-100)
 * - C_match = Certifications match score (0-100)
 * - W_s = Skills weight (default 0.6)
 * - W_e = Experience weight (default 0.3)
 * - W_c = Certifications weight (default 0.1)
 */
export const scoringService = {
  async calculateScore(candidateId: string, jobId: string): Promise<{
    overallScore: number;
    skillsScore: number;
    experienceScore: number;
    certsScore: number;
  }> {
    const [candidate, job] = await Promise.all([
      prisma.candidate.findUnique({ where: { id: candidateId } }),
      prisma.job.findUnique({ where: { id: jobId } }),
    ]);

    if (!candidate || !job) {
      throw new Error('Candidate or Job not found');
    }

    // Call AI service for semantic matching
    try {
      const response = await axios.post(`${config.aiService.url}/api/score`, {
        candidate: {
          skills: candidate.skills,
          experience: candidate.experience,
          certifications: candidate.certifications,
        },
        job: {
          requiredSkills: job.requiredSkills,
          requiredExperience: job.requiredExperience,
          requiredCerts: job.requiredCerts,
        },
        weights: {
          skills: job.skillsWeight,
          experience: job.experienceWeight,
          certifications: job.certsWeight,
        },
      });

      const scores = response.data;

      // Update application with scores
      const application = await prisma.application.findUnique({
        where: {
          jobId_candidateId: {
            jobId,
            candidateId,
          },
        },
      });

      if (application) {
        await prisma.application.update({
          where: { id: application.id },
          data: {
            overallScore: scores.overallScore,
            skillsScore: scores.skillsScore,
            experienceScore: scores.experienceScore,
            certsScore: scores.certsScore,
          },
        });
      }

      return scores;
    } catch (error) {
      // Fallback to basic keyword matching if AI service is unavailable
      return this.calculateBasicScore(candidate, job);
    }
  },

  calculateBasicScore(candidate: any, job: any): {
    overallScore: number;
    skillsScore: number;
    experienceScore: number;
    certsScore: number;
  } {
    // Skills matching (simple keyword matching)
    const candidateSkillsLower = candidate.skills.map((s: string) => s.toLowerCase());
    const requiredSkillsLower = job.requiredSkills.map((s: string) => s.toLowerCase());
    const matchedSkills = requiredSkillsLower.filter((rs: string) =>
      candidateSkillsLower.some((cs: string) => cs.includes(rs) || rs.includes(cs))
    );
    const skillsScore = (matchedSkills.length / Math.max(requiredSkillsLower.length, 1)) * 100;

    // Experience matching
    const experienceScore = candidate.experience && job.requiredExperience
      ? Math.min((candidate.experience / job.requiredExperience) * 100, 100)
      : candidate.experience && candidate.experience >= (job.requiredExperience || 0)
      ? 100
      : 0;

    // Certifications matching
    const candidateCertsLower = candidate.certifications.map((c: string) => c.toLowerCase());
    const requiredCertsLower = job.requiredCerts.map((c: string) => c.toLowerCase());
    const matchedCerts = requiredCertsLower.filter((rc: string) =>
      candidateCertsLower.some((cc: string) => cc.includes(rc) || rc.includes(cc))
    );
    const certsScore = (matchedCerts.length / Math.max(requiredCertsLower.length, 1)) * 100;

    // Calculate overall score using weights
    const overallScore =
      skillsScore * job.skillsWeight +
      experienceScore * job.experienceWeight +
      certsScore * job.certsWeight;

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      skillsScore: Math.round(skillsScore * 100) / 100,
      experienceScore: Math.round(experienceScore * 100) / 100,
      certsScore: Math.round(certsScore * 100) / 100,
    };
  },
};
