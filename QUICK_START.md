# AURA-ATS Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Start Infrastructure
```bash
docker-compose up -d
```

### Step 2: Install Dependencies
```bash
# Root
npm install

# Backend
cd backend && npm install && cd ..

# Frontend  
cd frontend && npm install && cd ..
```

### Step 3: Configure Environment
```bash
# Copy and edit .env files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

**Minimum required in `backend/.env`:**
```env
DATABASE_URL="mongodb://admin:admin123@localhost:27017/aura_ats?authSource=admin"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
ENCRYPTION_KEY="your-32-byte-key-here"
AI_SERVICE_URL="http://localhost:8000"
```

### Step 4: Setup Database
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Step 5: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - AI Service:**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 4 - Worker (Optional, for async processing):**
```bash
cd backend
npm run worker
```

### Step 6: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/health
- **AI Service**: http://localhost:8000/health

## ✅ Verify It's Working

1. Open http://localhost:3000
2. Press `Cmd+K` (or `Ctrl+K`) to test Command Palette
3. Navigate to "Job Architect" and create a job
4. Go to "Talent Ingest" and upload a PDF resume
5. Check "Pipeline" to see candidates
6. View "Analytics Studio" for visualizations

## 🎯 First Steps

1. **Create a Job**:
   - Go to Job Architect
   - Fill in job details
   - Adjust weighting sliders
   - Create job

2. **Upload Resumes**:
   - Go to Talent Ingest Lab
   - Select the job
   - Drag & drop PDF files
   - Watch real-time progress

3. **View Pipeline**:
   - Go to Pipeline
   - See candidates in Kanban board
   - Click candidate card to see Deep-Dive

4. **Explore Analytics**:
   - Go to Analytics Studio
   - View Skill-Gap Radar
   - Check Hiring Funnel
   - See Talent Heatmap

## 🔧 Troubleshooting

**MongoDB Connection Error:**
- Ensure Docker containers are running: `docker-compose ps`
- Check DATABASE_URL matches docker-compose.yml

**Vector Search Not Working:**
- Create indexes in MongoDB Atlas (see `MONGODB_SETUP.md`)
- Or use local MongoDB without vector search (scoring will still work)

**WebSocket Not Connecting:**
- Check `NEXT_PUBLIC_WS_URL` in frontend `.env.local`
- Ensure backend WebSocket server is running

**AI Service Errors:**
- Check Python version: `python --version` (needs 3.10+)
- Install dependencies: `pip install -r requirements.txt`
- Verify AI service is running on port 8000

---

**You're all set!** 🎉

The system is ready to use. Start creating jobs and uploading resumes!
