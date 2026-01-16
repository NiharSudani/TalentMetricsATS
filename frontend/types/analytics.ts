export interface DashboardKPIs {
  totalJobs: number;
  totalCandidates: number;
  hiredCount: number;
  activeJobs: number;
  hiringVelocity: number;
  offerAcceptanceRate: number;
}

export interface UrgentAction {
  id: string;
  type: 'candidate_review' | 'job_approval' | 'interview_scheduled';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface SkillGapData {
  skill: string;
  required: boolean;
  coverage: number; // 0-100
}

export interface FunnelData {
  applied: number;
  screening: number;
  interview: number;
  offered: number;
  hired: number;
  rejected: number;
}

export interface HeatmapData {
  id: string;
  skills: string[];
  score: number;
  experience: number;
}
