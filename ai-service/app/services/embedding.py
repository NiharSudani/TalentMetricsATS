"""
Embedding Service using Sentence-Transformers
Generates semantic embeddings for text using cosine similarity
Supports 1536-dim embeddings for OpenAI/Voyage compatibility
"""

from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Union
import asyncio
import os


class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize with a model
        For 1536-dim embeddings, use OpenAI embeddings API or Voyage AI
        Default: all-MiniLM-L6-v2 (384-dim) - lightweight and fast
        For production: Use OpenAI text-embedding-3-large (3072-dim) or Voyage (1024-dim)
        """
        self.model = SentenceTransformer(model_name)
        self.dimension = 384  # Default dimension
        
        # Check if OpenAI is available for 1536-dim embeddings
        self.use_openai = os.getenv('OPENAI_API_KEY') is not None
        if self.use_openai:
            try:
                import openai
                self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
                self.dimension = 1536  # OpenAI text-embedding-3-small dimension
            except:
                self.use_openai = False

    async def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding vector for a single text
        Uses OpenAI if available, otherwise falls back to Sentence-Transformers
        """
        if self.use_openai:
            try:
                # Use OpenAI for 1536-dim embeddings
                response = self.openai_client.embeddings.create(
                    model="text-embedding-3-small",  # 1536 dimensions
                    input=text[:8000],  # Limit text length
                )
                return np.array(response.data[0].embedding)
            except Exception as e:
                print(f"OpenAI embedding failed, falling back to local model: {e}")
        
        # Fallback to Sentence-Transformers
        loop = asyncio.get_event_loop()
        embedding = await loop.run_in_executor(
            None, self.model.encode, text
        )
        return embedding

    async def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for multiple texts (batch processing)
        """
        if self.use_openai:
            try:
                # Batch OpenAI embeddings
                response = self.openai_client.embeddings.create(
                    model="text-embedding-3-small",
                    input=[t[:8000] for t in texts],
                )
                return np.array([item.embedding for item in response.data])
            except Exception as e:
                print(f"OpenAI batch embedding failed, falling back: {e}")
        
        # Fallback to Sentence-Transformers
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            None, self.model.encode, texts
        )
        return embeddings

    def cosine_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings
        """
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = dot_product / (norm1 * norm2)
        # Normalize to 0-100 scale
        return float((similarity + 1) / 2 * 100)
