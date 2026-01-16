"""
Scoring Service
Implements the mathematical scoring formula:
Score = (S_match × W_s) + (E_match × W_e) + (C_match × W_c)
"""

from typing import List, Optional
import numpy as np
from app.services.embedding import EmbeddingService
from app.models.score import ScoreResponse, Weights


class ScoringService:
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service

    async def calculate_score(
        self,
        candidate_skills: List[str],
        candidate_experience: Optional[int],
        candidate_certs: List[str],
        job_skills: List[str],
        job_experience: Optional[int],
        job_certs: List[str],
        weights: Weights,
    ) -> ScoreResponse:
        """
        Calculate semantic match score using the formula:
        Score = (S_match × W_s) + (E_match × W_e) + (C_match × W_c)
        """
        
        # 1. Skills Score (S_match) - Semantic matching using embeddings
        skills_score = await self._calculate_skills_score(
            candidate_skills, job_skills
        )
        
        # 2. Experience Score (E_match)
        experience_score = self._calculate_experience_score(
            candidate_experience, job_experience
        )
        
        # 3. Certifications Score (C_match) - Semantic matching
        certs_score = await self._calculate_certs_score(
            candidate_certs, job_certs
        )
        
        # 4. Calculate overall score using weights
        overall_score = (
            skills_score * weights.skills +
            experience_score * weights.experience +
            certs_score * weights.certifications
        )
        
        # Generate explanation
        explanation = self._generate_explanation(
            skills_score, experience_score, certs_score, weights
        )
        
        return ScoreResponse(
            overallScore=round(overall_score, 2),
            skillsScore=round(skills_score, 2),
            experienceScore=round(experience_score, 2),
            certsScore=round(certs_score, 2),
            explanation=explanation,
        )

    async def _calculate_skills_score(
        self, candidate_skills: List[str], job_skills: List[str]
    ) -> float:
        """
        Calculate skills match score using semantic similarity
        Uses cosine similarity on embeddings instead of keyword matching
        """
        if not job_skills:
            return 100.0  # No requirements = perfect match
        
        if not candidate_skills:
            return 0.0
        
        # Generate embeddings for all skills
        all_skills = list(set(candidate_skills + job_skills))
        embeddings = await self.embedding_service.generate_embeddings(all_skills)
        
        # Create mapping
        skill_to_embedding = dict(zip(all_skills, embeddings))
        
        # Calculate semantic matches
        matched_scores = []
        for job_skill in job_skills:
            job_embedding = skill_to_embedding[job_skill]
            best_match = 0.0
            
            for candidate_skill in candidate_skills:
                candidate_embedding = skill_to_embedding[candidate_skill]
                similarity = self.embedding_service.cosine_similarity(
                    job_embedding, candidate_embedding
                )
                best_match = max(best_match, similarity)
            
            matched_scores.append(best_match)
        
        # Average of all required skills
        return sum(matched_scores) / len(matched_scores) if matched_scores else 0.0

    def _calculate_experience_score(
        self, candidate_exp: Optional[int], job_exp: Optional[int]
    ) -> float:
        """
        Calculate experience match score
        """
        if not job_exp:
            return 100.0  # No requirement = perfect match
        
        if not candidate_exp:
            return 0.0
        
        # Linear scaling: if candidate has >= required, score = 100
        # Otherwise, proportional
        if candidate_exp >= job_exp:
            return 100.0
        
        # Proportional score (e.g., 2 years for 4 years required = 50%)
        return (candidate_exp / job_exp) * 100.0

    async def _calculate_certs_score(
        self, candidate_certs: List[str], job_certs: List[str]
    ) -> float:
        """
        Calculate certifications match score using semantic similarity
        """
        if not job_certs:
            return 100.0  # No requirements = perfect match
        
        if not candidate_certs:
            return 0.0
        
        # Similar to skills: use semantic matching
        all_certs = list(set(candidate_certs + job_certs))
        embeddings = await self.embedding_service.generate_embeddings(all_certs)
        
        cert_to_embedding = dict(zip(all_certs, embeddings))
        
        matched_scores = []
        for job_cert in job_certs:
            job_embedding = cert_to_embedding[job_cert]
            best_match = 0.0
            
            for candidate_cert in candidate_certs:
                candidate_embedding = cert_to_embedding[candidate_cert]
                similarity = self.embedding_service.cosine_similarity(
                    job_embedding, candidate_embedding
                )
                best_match = max(best_match, similarity)
            
            matched_scores.append(best_match)
        
        return sum(matched_scores) / len(matched_scores) if matched_scores else 0.0

    def _generate_explanation(
        self,
        skills_score: float,
        experience_score: float,
        certs_score: float,
        weights: Weights,
    ) -> str:
        """
        Generate human-readable explanation of the score
        """
        parts = []
        
        if skills_score >= 80:
            parts.append(f"Strong skills match ({skills_score:.1f}%)")
        elif skills_score >= 50:
            parts.append(f"Moderate skills match ({skills_score:.1f}%)")
        else:
            parts.append(f"Weak skills match ({skills_score:.1f}%)")
        
        if experience_score >= 80:
            parts.append(f"meets experience requirements ({experience_score:.1f}%)")
        elif experience_score >= 50:
            parts.append(f"partially meets experience requirements ({experience_score:.1f}%)")
        else:
            parts.append(f"below experience requirements ({experience_score:.1f}%)")
        
        if certs_score >= 80:
            parts.append(f"strong certification alignment ({certs_score:.1f}%)")
        elif certs_score >= 50:
            parts.append(f"some relevant certifications ({certs_score:.1f}%)")
        else:
            parts.append(f"limited certification match ({certs_score:.1f}%)")
        
        return ". ".join(parts) + "."
