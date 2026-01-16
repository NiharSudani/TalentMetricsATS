# AURA-ATS Enterprise Intelligence System

> Production-grade Applicant Tracking System with AI-powered Data Analysis & Visualization

## 🎯 Overview

AURA-ATS is a modern, enterprise-ready Applicant Tracking System built with a focus on **Data Analysis & Visualization (DAV)**. It combines semantic AI matching, real-time analytics, and a beautiful Linear.app-inspired interface to revolutionize talent acquisition.

## 🏗️ Architecture

### Monorepo Structure
```
TalentMetricsATS/
├── frontend/          # Next.js 15 App Router (TypeScript)
├── backend/           # Node.js/Express/TypeScript + Prisma
├── ai-service/        # Python FastAPI microservice
└── shared/            # Shared types and constants
```

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts + Shadcn UI
- Lucide Icons

**Backend:**
- Node.js + Express (TypeScript)
- Prisma ORM
- PostgreSQL + pgvector (semantic search)
- Redis + BullMQ (async processing)
- JWT Authentication

**AI Service:**
- Python FastAPI
- PyMuPDF (PDF parsing)
- Sentence-Transformers (embeddings)
- Cosine Similarity (semantic matching)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL 16+ (with pgvector)

### 1. Clone & Install

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install Python dependencies
cd ai-service && pip install -r requirements.txt && cd ..
```

### 2. Environment Setup

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
cp ai-service/.env.example ai-service/.env
```

Update `.env` files with your configuration.

### 3. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Run Prisma migrations
cd backend
npm run prisma:migrate
npm run prisma:generate
cd ..
```

### 4. Start Services

```bash
# Start all services (from root)
npm run dev

# Or start individually:
npm run dev:backend    # Backend API (port 3001)
npm run dev:frontend   # Frontend (port 3000)
npm run dev:ai         # AI Service (port 8000)
```

## 📁 Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed directory layout.

## 🎨 Key Features

### 1. Command Center (Dashboard)
- Real-time KPIs: Hiring Velocity, Offer Acceptance Rate, Pipeline Health
- Urgent Actions feed with staggered animations
- Live pipeline metrics

### 2. Job Architect
- Dynamic job description creation
- Skills, Experience, and Certifications input
- **Weighting Engine**: Adjustable weights (Skills 60%, Experience 30%, Certs 10%)
- Influences AI scoring algorithm

### 3. Talent Ingest Lab
- Drag-and-drop bulk upload (10,000+ PDFs)
- Real-time WebSocket progress bars
- Async processing: Parsing → Embedding → Scoring

### 4. Pipeline View (Kanban)
- Smooth drag-and-drop board
- Statuses: Applied, Screening, Interview, Offered, Hired, Rejected
- Real-time updates

### 5. Analytics Studio (DAV Core)
- **Skill-Gap Radar**: JD requirements vs. Candidate profiles
- **Hiring Funnel**: Sankey diagram showing drop-off points
- **Talent Heatmap**: Competency clusters visualization
- **Candidate Deep-Dive**: AI-generated fit analysis

### 6. Candidate Deep-Dive
- AI-generated summaries
- Score breakdown visualization
- **Blind Hiring Toggle**: Mask PII (Name, Gender, Location) for bias-free review

## 🤖 AI Scoring Algorithm

### Formula
```
Score = (S_match × W_s) + (E_match × W_e) + (C_match × W_c)
```

Where:
- **S_match** = Skills match score (0-100) - Semantic similarity using embeddings
- **E_match** = Experience match score (0-100)
- **C_match** = Certifications match score (0-100) - Semantic similarity
- **W_s** = Skills weight (default: 0.6)
- **W_e** = Experience weight (default: 0.3)
- **W_c** = Certifications weight (default: 0.1)

### Semantic Matching
Instead of keyword matching, AURA-ATS uses **cosine similarity** on embeddings:
- "Frontend Engineer" matches "React Developer"
- "Cloud Architect" matches "AWS Solutions Architect"
- Context-aware skill matching

## 🔒 Security Features

- **Encryption**: AES-256-GCM for stored resumes
- **Rate Limiting**: Strict API rate limits
- **Audit Trail**: All status changes logged with user ID and timestamp
- **JWT Authentication**: Secure token-based auth
- **Error Handling**: Global error boundaries and centralized logging

## 📊 Database Schema

See `backend/prisma/schema.prisma` for the complete schema.

Key models:
- `User` - Authentication and authorization
- `Job` - Job descriptions with weighting configuration
- `Candidate` - Candidate profiles with embeddings
- `AuditLog` - Complete audit trail
- `ResumeProcessing` - Queue tracking

## 🧪 Development

### Backend
```bash
cd backend
npm run dev          # Development server
npm run build        # Build TypeScript
npm run prisma:studio # Open Prisma Studio
```

### Frontend
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint code
```

### AI Service
```bash
cd ai-service
uvicorn app.main:app --reload --port 8000
```

## 🐳 Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📝 API Documentation

### Backend API
- Base URL: `http://localhost:3001/api`
- Health: `GET /health`

### AI Service API
- Base URL: `http://localhost:8000/api`
- Health: `GET /health`
- Parse Resume: `POST /api/parse`
- Calculate Score: `POST /api/score`

## 🎯 Roadmap

- [ ] WebSocket real-time updates
- [ ] Advanced analytics dashboards
- [ ] Email notifications
- [ ] Candidate portal
- [ ] Integration with job boards
- [ ] Mobile app

## 📄 License

Proprietary - All rights reserved

## 👥 Contributing

This is an enterprise project. Contact the development team for contribution guidelines.

---

**Built with ❤️ by the AURA-ATS Team**
