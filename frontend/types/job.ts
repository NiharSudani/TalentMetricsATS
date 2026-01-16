export enum JobStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
}

export interface Job {
  id: string;
  title: string;
  description: string;
  department?: string;
  location?: string;
  status: JobStatus;
  skillsWeight: number;
  experienceWeight: number;
  certsWeight: number;
  requiredSkills: string[];
  requiredExperience?: number;
  requiredCerts: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface JobWeights {
  skills: number;
  experience: number;
  certifications: number;
}
