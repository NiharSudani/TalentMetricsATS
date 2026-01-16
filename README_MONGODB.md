# AURA-ATS MongoDB Edition

## 🎯 Overview

AURA-ATS has been migrated to **MongoDB Atlas** with **Vector Search** capabilities. This enables powerful semantic search using embeddings stored directly in MongoDB.

## 🔄 Key Changes from PostgreSQL Version

### Database
- ✅ **MongoDB** replaces PostgreSQL
- ✅ **Atlas Vector Search** replaces pgvector
- ✅ **Application Model** links Jobs and Candidates (many-to-many)
- ✅ **Embeddings** stored as `Float[]` arrays (384 dimensions)

### Architecture Changes

1. **Collections** (instead of tables):
   - `jobs` - Job descriptions with embeddings
   - `candidates` - Candidate profiles with embeddings
   - `applications` - Links jobs and candidates with scores
   - `users` - Authentication
   - `audit_logs` - Activity tracking

2. **Vector Search**:
   - Uses MongoDB's `$vectorSearch` aggregation stage
   - Cosine similarity calculated automatically by Atlas
   - No need for separate vector database

3. **Scoring**:
   - Scores stored per Application (not per Candidate)
   - Supports candidates applying to multiple jobs
   - Vector similarity score stored alongside AI scores

## 🚀 Quick Start

### 1. Setup MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Create Vector Search indexes (see `MONGODB_SETUP.md`)

**Option B: Local MongoDB**
```bash
docker-compose up -d mongodb
```

### 2. Update Environment

```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/aura_ats?retryWrites=true&w=majority"
```

Or for local:
```env
DATABASE_URL="mongodb://admin:admin123@localhost:27017/aura_ats?authSource=admin"
```

### 3. Run Migrations

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### 4. Create Vector Search Indexes

See `MONGODB_SETUP.md` for detailed instructions.

## 📊 Vector Search Features

### Ranking Dashboard
- `/api/analytics/ranking/:jobId` - Get top candidates using vector similarity
- Automatically ranks candidates by semantic match
- Stores similarity scores in Application model

### Skill Gap Analysis
- Compares candidate embedding with job embedding
- Uses cosine similarity for accurate matching
- Visualizes skill coverage across candidate pool

## 🔍 Search Capabilities

1. **Vector Search** (Semantic):
   - Find candidates similar to job description
   - Find jobs similar to candidate profile
   - Uses 384-dimensional embeddings

2. **Atlas Search** (Full-text):
   - Fuzzy matching for Command-K search
   - Text search across all fields
   - Can combine with vector search

## 📝 Data Model

### Application Model
```typescript
{
  jobId: ObjectId,
  candidateId: ObjectId,
  status: CandidateStatus,
  overallScore: Float,
  skillsScore: Float,
  experienceScore: Float,
  certsScore: Float,
  vectorSimilarity: Float, // From Atlas Vector Search
  aiSummary: String
}
```

### Embeddings
- **Candidates**: Resume text → 384-dim vector
- **Jobs**: Job description → 384-dim vector
- Stored as `Float[]` arrays in MongoDB
- Generated using Sentence-Transformers (all-MiniLM-L6-v2)

## 🎨 Frontend Updates Needed

The frontend should be updated to:
1. Use `applications` instead of direct candidate-job relationships
2. Display vector similarity scores
3. Show ranking dashboard with semantic matches
4. Update pipeline to work with Application IDs

## 🔧 Development

### Prisma Studio
```bash
npm run prisma:studio
```

### MongoDB Compass
Download [MongoDB Compass](https://www.mongodb.com/products/compass) to visualize data.

### Vector Search Testing
```bash
# Test ranking endpoint
curl http://localhost:3001/api/analytics/ranking/<jobId>
```

## 📚 Documentation

- `MONGODB_SETUP.md` - Vector Search index setup
- `PROJECT_STRUCTURE.md` - Updated project structure
- `SETUP.md` - General setup guide

## ⚠️ Important Notes

1. **Vector Search Indexes**: Must be created in Atlas UI before using vector search
2. **Embedding Dimensions**: Must be exactly 384 (matching model output)
3. **Index Names**: Must match `candidate_vector_index` and `job_vector_index`
4. **Application Model**: All job-candidate relationships go through Applications

## 🎯 Next Steps

1. ✅ Database migration complete
2. ✅ Vector search service implemented
3. ⏳ Frontend updates for Application model
4. ⏳ Command-K search with Atlas Search
5. ⏳ Enhanced analytics with vector similarity

---

**MongoDB Edition** - Powered by Atlas Vector Search 🚀
