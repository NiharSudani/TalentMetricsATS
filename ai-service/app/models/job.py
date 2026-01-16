from pydantic import BaseModel
from typing import List, Optional


class JobDescription(BaseModel):
    requiredSkills: List[str]
    requiredExperience: Optional[int]
    requiredCerts: List[str]
