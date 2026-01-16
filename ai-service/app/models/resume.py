from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class ResumeParseRequest(BaseModel):
    pdf_content: bytes


class ResumeParseResponse(BaseModel):
    text: str
    skills: List[str]
    experience: Optional[int]
    certifications: List[str]
    education: Optional[Dict[str, Any]]
    work_history: Optional[List[Dict[str, Any]]]
    personal_info: Optional[Dict[str, str]]


class CandidateProfile(BaseModel):
    skills: List[str]
    experience: Optional[int]
    certifications: List[str]
