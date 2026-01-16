from pydantic import BaseModel
from typing import Optional
from app.models.resume import CandidateProfile
from app.models.job import JobDescription


class Weights(BaseModel):
    skills: float = 0.6
    experience: float = 0.3
    certifications: float = 0.1


class ScoreRequest(BaseModel):
    candidate: CandidateProfile
    job: JobDescription
    weights: Weights


class ScoreResponse(BaseModel):
    overallScore: float
    skillsScore: float
    experienceScore: float
    certsScore: float
    explanation: Optional[str] = None
