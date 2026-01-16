import { PrismaClient } from '@prisma/client';
import { vectorSearchService } from './vector-search.service.js';
import { scoringAggregationService } from './scoring-aggregation.service.js';

const prisma = new PrismaClient();

export const analyticsService = {
  async getDashboard() {
    const [totalJobs, totalCandidates, totalApplications, hiredCount, activeJobs] = await Promise.all([
      prisma.job.count(),
      prisma.candidate.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'HIRED' } }),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
    ]);

    // Calculate hiring velocity (applications hired in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = await prisma.application.count({
      where: {
        status: 'HIRED',
        updatedAt: { gte: thirtyDaysAgo },
      },
    });

    // Calculate offer acceptance rate
    const offeredCount = await prisma.application.count({ where: { status: 'OFFERED' } });
    const acceptanceRate = offeredCount > 0 ? (hiredCount / offeredCount) * 100 : 0;

    return {
      kpis: {
        totalJobs,
        totalCandidates,
        totalApplications,
        hiredCount,
        activeJobs,
        hiringVelocity: recentHires,
        offerAcceptanceRate: Math.round(acceptanceRate * 100) / 100,
      },
      urgentActions: [], // Will be populated with actual urgent items
    };
  },

  async getSkillGap(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          include: {
            candidate: true,
          },
        },
      },
    });

    if (!job) {
      return { error: 'Job not found' };
    }

    const requiredSkills = job.requiredSkills;
    const applications = job.applications;
    
    // Calculate skill coverage across all candidates
    const skillCoverage = requiredSkills.map((skill) => {
      const candidatesWithSkill = applications.filter((app) => {
        const candidateSkills = app.candidate.skills || [];
        // Handle both string and object skills
        const skillNames = candidateSkills.map((s: any) => 
          typeof s === 'string' ? s : s.name || ''
        );
        return skillNames.some((cs: string) =>
          cs.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(cs.toLowerCase())
        );
      }).length;
      
      return {
        skill,
        required: true,
        coverage: applications.length > 0 
          ? (candidatesWithSkill / applications.length) * 100 
          : 0,
        candidatesWithSkill,
        totalCandidates: applications.length,
      };
    });

    return { skillGap: skillCoverage };
  },

  async getFunnel(jobId: string) {
    const applications = await prisma.application.findMany({
      where: { jobId },
    });

    const funnel = {
      applied: applications.filter((a) => a.status === 'APPLIED').length,
      screening: applications.filter((a) => a.status === 'SCREENING').length,
      interview: applications.filter((a) => a.status === 'INTERVIEW').length,
      offered: applications.filter((a) => a.status === 'OFFERED').length,
      hired: applications.filter((a) => a.status === 'HIRED').length,
      rejected: applications.filter((a) => a.status === 'REJECTED').length,
    };

    return { funnel };
  },

  async getHeatmap(jobId: string) {
    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: true,
      },
    });

    // Group candidates by competency clusters
    const heatmap = applications.map((app) => ({
      id: app.candidateId,
      applicationId: app.id,
      skills: app.candidate.skills || [],
      score: app.overallScore || 0,
      vectorSimilarity: app.vectorSimilarity || 0,
      experience: app.candidate.experience || 0,
      pcaCoordinates: app.candidate.pcaCoordinates,
      tsneCoordinates: app.candidate.tsneCoordinates,
    }));

    return { heatmap };
  },

  /**
   * Get ranking dashboard using vector search and scoring aggregation
   */
  async getRankingDashboard(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Use scoring aggregation service for ranked results
    const rankedCandidates = await scoringAggregationService.scoreAndRankCandidates(jobId, 50);

    return {
      job,
      candidates: rankedCandidates,
    };
  },
};
