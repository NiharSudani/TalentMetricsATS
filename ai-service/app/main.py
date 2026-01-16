"""
AURA-ATS AI Microservice
FastAPI service for resume parsing, embedding generation, and semantic scoring
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

from app.api.routes import router
from app.api import generate_insights
from app.models.resume import ResumeParseRequest, ResumeParseResponse
from app.models.job import JobDescription
from app.models.score import ScoreRequest, ScoreResponse
from app.services.parser import ResumeParser
from app.services.embedding import EmbeddingService
from app.services.scorer import ScoringService

load_dotenv()

app = FastAPI(
    title="AURA-ATS AI Service",
    description="AI-powered resume parsing and semantic matching",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize services
parser = ResumeParser()
embedding_service = EmbeddingService()
scoring_service = ScoringService(embedding_service)

# Include routes
app.include_router(router, prefix="/api", tags=["api"])
app.include_router(generate_insights.router, prefix="/api", tags=["ai"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "aura-ats-ai"}


@app.post("/api/parse")
async def parse_resume(file: UploadFile = File(...)):
    """
    Parse a PDF resume and extract structured data + generate embedding
    Returns: parsed data with embedding vector (384 dimensions)
    """
    try:
        content = await file.read()
        parsed_data = await parser.parse_pdf(content)
        
        # Generate embedding for the resume text
        embedding = await embedding_service.generate_embedding(parsed_data.text)
        
        # Add embedding to response
        response_dict = parsed_data.dict()
        response_dict['embedding'] = embedding.tolist()  # Convert numpy array to list
        
        return response_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")


@app.post("/api/embed")
async def generate_embedding(text: str):
    """
    Generate embedding vector for text
    Returns: embedding vector (384 dimensions)
    """
    try:
        embedding = await embedding_service.generate_embedding(text)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")


@app.post("/api/score", response_model=ScoreResponse)
async def calculate_score(request: ScoreRequest):
    """
    Calculate semantic match score between candidate and job description
    
    Scoring Formula:
    Score = (S_match × W_s) + (E_match × W_e) + (C_match × W_c)
    """
    try:
        score_result = await scoring_service.calculate_score(
            candidate_skills=request.candidate.skills,
            candidate_experience=request.candidate.experience,
            candidate_certs=request.candidate.certifications,
            job_skills=request.job.requiredSkills,
            job_experience=request.job.requiredExperience,
            job_certs=request.job.requiredCerts,
            weights=request.weights,
        )
        return score_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


@app.post("/api/job/embed")
async def generate_job_embedding(description: str):
    """
    Generate embedding for job description
    Used when creating/updating jobs
    """
    try:
        embedding = await embedding_service.generate_embedding(description)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job embedding generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
