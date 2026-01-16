# MongoDB Atlas Vector Search Setup Guide

## Prerequisites

1. MongoDB Atlas account (free tier works)
2. Cluster created and running
3. Database user with read/write permissions

## Step 1: Create Vector Search Indexes

### For Candidates Collection

1. Go to MongoDB Atlas UI → Your Cluster → "Search" tab
2. Click "Create Search Index"
3. Select "JSON Editor"
4. Use this configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "string",
      "path": "email"
    },
    {
      "type": "string",
      "path": "skills"
    }
  ]
}
```

5. Name it: `candidate_vector_index`
6. Click "Create Search Index"

### For Jobs Collection

1. Create another search index for the `jobs` collection
2. Use this configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "string",
      "path": "title"
    },
    {
      "type": "string",
      "path": "description"
    }
  ]
}
```

3. Name it: `job_vector_index`
4. Click "Create Search Index"

**Note**: Index creation can take a few minutes. Wait for status to show "Active".

## Step 2: Update Environment Variables

Update your `.env` file:

```env
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/aura_ats?retryWrites=true&w=majority"
```

For local MongoDB:
```env
DATABASE_URL="mongodb://admin:admin123@localhost:27017/aura_ats?authSource=admin"
```

## Step 3: Verify Setup

1. Run Prisma migrations:
```bash
cd backend
npm run prisma:migrate
```

2. Generate Prisma client:
```bash
npm run prisma:generate
```

3. Test the connection:
```bash
npm run prisma:studio
```

## Step 4: Test Vector Search

Once indexes are active, you can test vector search using the `/api/analytics/ranking/:jobId` endpoint.

The vector search will automatically:
- Use the job's embedding to search candidate embeddings
- Return candidates ranked by cosine similarity
- Store similarity scores in the Application model

## Troubleshooting

### Index Not Found Error
- Ensure indexes are created and status is "Active"
- Check index names match: `candidate_vector_index` and `job_vector_index`
- Wait a few minutes after creation for indexes to become active

### Connection Issues
- Verify DATABASE_URL format is correct
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
- Ensure database user has read/write permissions

### Vector Dimension Mismatch
- Ensure embeddings are exactly 384 dimensions (all-MiniLM-L6-v2 model)
- Check AI service is generating correct dimension vectors

## Atlas Search vs Vector Search

- **Atlas Search**: Full-text search with fuzzy matching (for Command-K search)
- **Vector Search**: Semantic similarity search using embeddings

Both can be used together for comprehensive search capabilities.
