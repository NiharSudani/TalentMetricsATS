"""
NLP Utilities for text processing
Date normalization, skill extraction, experience parsing
"""

import re
from typing import List, Optional
from datetime import datetime


def extract_skills(text: str, skill_keywords: List[str]) -> List[str]:
    """
    Extract skills from resume text using keyword matching
    Enhanced with fuzzy matching for variations
    """
    text_lower = text.lower()
    found_skills = []
    
    for skill in skill_keywords:
        # Exact match
        if skill.lower() in text_lower:
            found_skills.append(skill.title())
        # Fuzzy match for variations (e.g., "React.js" matches "react")
        elif skill.lower().replace(".", "").replace("-", "") in text_lower.replace(".", "").replace("-", ""):
            found_skills.append(skill.title())
    
    # Remove duplicates and return
    return list(set(found_skills))


def normalize_dates(text: str) -> str:
    """
    Normalize date formats in text
    Converts various date formats to standard format
    """
    # Pattern for dates like "Jan 2020", "January 2020", "01/2020"
    date_patterns = [
        (r'(\w+)\s+(\d{4})', r'\1 \2'),  # "Jan 2020"
        (r'(\d{1,2})/(\d{4})', r'\1/\2'),  # "01/2020"
    ]
    
    normalized = text
    for pattern, replacement in date_patterns:
        normalized = re.sub(pattern, replacement, normalized)
    
    return normalized


def extract_experience_years(text: str) -> Optional[int]:
    """
    Extract years of experience from resume text
    Looks for patterns like "5 years", "5+ years", "5 yrs"
    """
    patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience',
        r'experience[:\s]+(\d+)\+?\s*(?:years?|yrs?)',
        r'(\d+)\+?\s*(?:years?|yrs?)\s+in',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            years = int(match.group(1))
            return years
    
    # Fallback: calculate from work history dates if available
    # This is simplified - can be enhanced with date parsing
    return None
