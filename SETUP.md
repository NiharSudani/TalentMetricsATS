# AURA-ATS Setup Guide

## Initial Setup Steps

### 1. Install Dependencies

```bash
# Root workspace
npm install

# Frontend
cd frontend
npm install
cd ..

# Backend
cd backend
npm install
cd ..

# AI Service (Python)
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment Variables

Create `.env` files in each directory:

**Root `.env`:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aura_ats?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ENCRYPTION_KEY="your-32-byte-encryption-key-for-aes-256-gcm"
AI_SERVICE_URL="http://localhost:8000"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**Backend `.env`:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aura_ats?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ENCRYPTION_KEY="your-32-byte-encryption-key-for-aes-256-gcm"
AI_SERVICE_URL="http://localhost:8000"
PORT=3001
NODE_ENV=development
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**AI Service `.env`:**
```env
API_KEY=your-ai-service-api-key
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL (with pgvector) and Redis
docker-compose up -d

# Verify containers are running
docker-compose ps
```

### 4. Initialize Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 5. Start Development Servers

**Option A: Start all at once (from root)**
```bash
npm run dev
```

**Option B: Start individually**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - AI Service:
```bash
cd ai-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### 6. Verify Installation

- **Backend API**: http://localhost:3001/health
- **Frontend**: http://localhost:3000
- **AI Service**: http://localhost:8000/health

## Troubleshooting

### PostgreSQL Connection Issues
- Ensure Docker containers are running: `docker-compose ps`
- Check DATABASE_URL in `.env` matches docker-compose.yml
- Verify pgvector extension: Connect to DB and run `CREATE EXTENSION IF NOT EXISTS vector;`

### Prisma Migration Issues
- Delete `backend/prisma/migrations` folder and re-run migrations
- Ensure DATABASE_URL is correct
- Check PostgreSQL logs: `docker-compose logs postgres`

### Python/AI Service Issues
- Ensure Python 3.10+ is installed: `python --version`
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`
- Check if Sentence-Transformers model downloads correctly (first run downloads model)

### Frontend Build Issues
- Clear Next.js cache: `rm -rf frontend/.next`
- Reinstall dependencies: `cd frontend && rm -rf node_modules && npm install`

## Next Steps

1. Create your first user account via `/api/auth/register`
2. Create a job posting via Job Architect
3. Upload resumes via Talent Ingest Lab
4. View analytics in Analytics Studio

## Production Deployment

See deployment documentation (to be added) for production setup instructions.
