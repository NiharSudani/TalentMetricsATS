"""
GPT-4o AI Insights Generation
Generates "Why this candidate?" summary using OpenAI GPT-4o
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter()

# Try to import OpenAI (optional dependency)
try:
    import openai
    from dotenv import load_dotenv
    load_dotenv()
    openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY')) if os.getenv('OPENAI_API_KEY') else None
    OPENAI_AVAILABLE = openai_client is not None
except ImportError:
    OPENAI_AVAILABLE = False
    openai_client = None


class InsightsRequest(BaseModel):
    candidate: dict
    job: dict


@router.post("/generate-insights")
async def generate_insights(request: InsightsRequest):
    """
    Generate AI insights using GPT-4o to explain why a candidate is a good fit
    """
    try:
        if OPENAI_AVAILABLE and openai_client:
            # Use GPT-4o for insights
            prompt = f"""
            Analyze this candidate's fit for the job position and provide a concise summary explaining why they are (or aren't) a good match.

            Job Title: {request.job.get('title', 'N/A')}
            Job Description: {request.job.get('description', 'N/A')}
            Required Skills: {', '.join(request.job.get('requiredSkills', []))}

            Candidate Skills: {request.candidate.get('skills', [])}
            Years of Experience: {request.candidate.get('experience', 'N/A')}
            
            Provide a 2-3 sentence summary focusing on:
            1. Key strengths that align with the role
            2. Potential gaps or concerns
            3. Overall recommendation

            Be specific and actionable.
            """

            response = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert HR recruiter analyzing candidate-job fit."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7,
            )

            insights = response.choices[0].message.content
            return {"insights": insights, "model": "gpt-4o"}
        else:
            # Fallback: Generate basic insights without GPT-4o
            candidate_skills = request.candidate.get('skills', [])
            if isinstance(candidate_skills, list) and len(candidate_skills) > 0:
                # Handle both string and object skills
                skill_names = [s if isinstance(s, str) else s.get('name', '') for s in candidate_skills]
            else:
                skill_names = []
                
            job_skills = request.job.get('requiredSkills', [])
            
            matched_skills = [s for s in skill_names if any(js.lower() in str(s).lower() for js in job_skills)]
            match_percentage = (len(matched_skills) / len(job_skills) * 100) if job_skills else 0
            
            experience = request.candidate.get('experience', 0)
            required_exp = request.job.get('requiredExperience', 0)
            
            insights = f"This candidate demonstrates {'strong' if match_percentage >= 70 else 'moderate' if match_percentage >= 50 else 'limited'} alignment with the role. "
            insights += f"Key skills match: {len(matched_skills)}/{len(job_skills)} required skills ({match_percentage:.0f}%). "
            
            if experience and required_exp:
                if experience >= required_exp:
                    insights += f"Experience level meets requirements ({experience} years). "
                else:
                    insights += f"Experience slightly below requirements ({experience} vs {required_exp} years). "
            
            insights += "Review full profile for detailed assessment."
            
            return {"insights": insights, "model": "fallback"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")
