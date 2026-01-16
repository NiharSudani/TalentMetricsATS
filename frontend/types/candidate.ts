export enum CandidateStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  status: CandidateStatus;
  skills: string[];
  experience?: number;
  certifications: string[];
  overallScore?: number;
  skillsScore?: number;
  experienceScore?: number;
  certsScore?: number;
  aiSummary?: string;
  jobId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateAnalysis {
  candidate: Candidate;
  analysis: string;
  scoreBreakdown: {
    overall: number;
    skills: number;
    experience: number;
    certifications: number;
  };
}
