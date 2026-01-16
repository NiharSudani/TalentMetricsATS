"""
Resume Parser using PyMuPDF
Extracts text, skills, experience, certifications from PDF resumes
"""

import fitz  # PyMuPDF
import re
from typing import List, Optional, Dict, Any
from app.models.resume import ResumeParseResponse
from app.utils.nlp import extract_skills, normalize_dates, extract_experience_years


class ResumeParser:
    def __init__(self):
        self.skill_keywords = [
            "python", "javascript", "react", "node.js", "typescript", "java",
            "sql", "aws", "docker", "kubernetes", "git", "agile", "scrum",
            "machine learning", "ai", "data science", "frontend", "backend",
            "full stack", "devops", "ci/cd", "rest api", "graphql", "mongodb",
            "postgresql", "redis", "elasticsearch", "terraform", "ansible"
        ]

    async def parse_pdf(self, pdf_content: bytes) -> ResumeParseResponse:
        """
        Parse PDF resume and extract structured data
        """
        try:
            # Open PDF from bytes
            doc = fitz.open(stream=pdf_content, filetype="pdf")
            
            # Extract text from all pages
            full_text = ""
            for page in doc:
                full_text += page.get_text()
            
            doc.close()
            
            # Normalize text
            full_text = self._normalize_text(full_text)
            
            # Extract structured data
            skills = extract_skills(full_text, self.skill_keywords)
            experience = extract_experience_years(full_text)
            certifications = self._extract_certifications(full_text)
            education = self._extract_education(full_text)
            work_history = self._extract_work_history(full_text)
            personal_info = self._extract_personal_info(full_text)
            
            return ResumeParseResponse(
                text=full_text,
                skills=skills,
                experience=experience,
                certifications=certifications,
                education=education,
                work_history=work_history,
                personal_info=personal_info,
            )
        except Exception as e:
            raise Exception(f"PDF parsing error: {str(e)}")

    def _normalize_text(self, text: str) -> str:
        """Normalize extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)]', '', text)
        return text.strip()

    def _extract_certifications(self, text: str) -> List[str]:
        """Extract certifications from resume text"""
        cert_patterns = [
            r'(?:AWS|Amazon Web Services)\s+(?:Certified\s+)?([A-Z][A-Za-z\s]+)',
            r'(?:Google|GCP)\s+(?:Cloud\s+)?(?:Professional\s+)?([A-Z][A-Za-z\s]+)',
            r'(?:Microsoft|Azure)\s+(?:Certified\s+)?([A-Z][A-Za-z\s]+)',
            r'(?:Cisco|CCNA|CCNP|CCIE)\s+([A-Za-z\s]+)',
            r'(?:PMP|Project Management Professional)',
            r'(?:Scrum|CSM|Certified Scrum Master)',
        ]
        
        certifications = []
        for pattern in cert_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            certifications.extend(matches)
        
        # Remove duplicates and normalize
        return list(set([c.strip().title() for c in certifications if c.strip()]))

    def _extract_education(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract education information"""
        # Simple extraction - can be enhanced with NLP
        degree_patterns = [
            r'(?:Bachelor|B\.S\.|B\.A\.|BS|BA)\s+(?:of\s+)?(?:Science|Arts)?\s+in\s+([A-Za-z\s]+)',
            r'(?:Master|M\.S\.|M\.A\.|MS|MA)\s+(?:of\s+)?(?:Science|Arts)?\s+in\s+([A-Za-z\s]+)',
            r'(?:PhD|Ph\.D\.|Doctorate)\s+(?:in\s+)?([A-Za-z\s]+)',
        ]
        
        degrees = []
        for pattern in degree_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            degrees.extend(matches)
        
        if degrees:
            return {
                "degrees": [d.strip() for d in degrees],
                "highest_degree": degrees[0].strip() if degrees else None,
            }
        return None

    def _extract_work_history(self, text: str) -> Optional[List[Dict[str, Any]]]:
        """Extract work history"""
        # This is a simplified extraction - can be enhanced with NLP libraries
        # Look for date patterns and job titles
        work_pattern = r'(\d{4}|\w+\s+\d{4})\s*[-–—]\s*(\d{4}|\w+\s+\d{4}|Present|Current)'
        matches = re.findall(work_pattern, text)
        
        if matches:
            return [
                {
                    "start_date": match[0],
                    "end_date": match[1],
                }
                for match in matches[:5]  # Limit to 5 most recent
            ]
        return None

    def _extract_personal_info(self, text: str) -> Optional[Dict[str, str]]:
        """Extract personal information"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        
        email_match = re.search(email_pattern, text)
        phone_match = re.search(phone_pattern, text)
        
        info = {}
        if email_match:
            info["email"] = email_match.group()
        if phone_match:
            info["phone"] = phone_match.group()
        
        return info if info else None
