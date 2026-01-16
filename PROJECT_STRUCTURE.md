# AURA-ATS Enterprise Intelligence System
## Project Directory Structure

```
TalentMetricsATS/
├── README.md                          # Project overview & setup instructions
├── .gitignore                         # Git ignore rules
├── .env.example                       # Environment variables template
├── docker-compose.yml                 # Docker services (PostgreSQL, Redis)
├── package.json                       # Root workspace package.json (monorepo)
│
├── frontend/                          # Next.js 15 App Router Frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── .env.local.example
│   │
│   ├── app/                           # App Router structure
│   │   ├── layout.tsx                 # Root layout with Sidebar
│   │   ├── page.tsx                   # Landing/Command Center
│   │   ├── loading.tsx                # Global loading UI
│   │   ├── error.tsx                  # Global error boundary
│   │   ├── not-found.tsx              # 404 page
│   │   │
│   │   ├── (dashboard)/               # Dashboard route group
│   │   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   │   │
│   │   │   ├── command-center/        # Command Center (Dashboard)
│   │   │   │   └── page.tsx           # Real-time KPIs & Urgent Actions
│   │   │   │
│   │   │   ├── job-architect/         # Job Architect (JD Creator)
│   │   │   │   ├── page.tsx           # Job creation form
│   │   │   │   └── [id]/              # Edit job
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── talent-ingest/         # Talent Ingest Lab
│   │   │   │   └── page.tsx           # Bulk upload with WebSocket progress
│   │   │   │
│   │   │   ├── pipeline/               # Pipeline View (Kanban)
│   │   │   │   ├── page.tsx           # Kanban board
│   │   │   │   └── [jobId]/           # Pipeline for specific job
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── analytics/              # Analytics Studio (DAV Core)
│   │   │   │   ├── page.tsx           # Main analytics dashboard
│   │   │   │   ├── skill-gap/         # Skill-Gap Radar
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── funnel/            # Hiring Funnel (Sankey)
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── heatmap/           # Talent Heatmap
│   │   │   │   │   └── page.tsx
│   │   │   │   └── candidate/[id]/    # Candidate Deep-Dive
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── candidates/            # Candidate management
│   │   │       ├── page.tsx           # Candidate list
│   │   │       └── [id]/              # Candidate detail
│   │   │           └── page.tsx
│   │   │
│   │   └── api/                       # Next.js API routes (if needed)
│   │       └── websocket/             # WebSocket endpoint for progress
│   │
│   ├── components/                    # React components
│   │   ├── ui/                        # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── command.tsx            # Command Palette (Cmd+K)
│   │   │   └── ...
│   │   │
│   │   ├── layout/                    # Layout components
│   │   │   ├── Sidebar.tsx            # Main navigation sidebar
│   │   │   ├── Header.tsx             # Top header bar
│   │   │   ├── CommandPalette.tsx     # Global search (Cmd+K)
│   │   │   └── ErrorBoundary.tsx      # React error boundary
│   │   │
│   │   ├── dashboard/                 # Dashboard components
│   │   │   ├── KPICard.tsx            # KPI metric cards
│   │   │   ├── UrgentActions.tsx      # Urgent actions feed
│   │   │   └── PipelineHealth.tsx     # Pipeline health indicator
│   │   │
│   │   ├── job-architect/             # Job Architect components
│   │   │   ├── JobForm.tsx            # Main job creation form
│   │   │   ├── SkillsInput.tsx        # Skills input with autocomplete
│   │   │   ├── WeightingEngine.tsx    # Weight slider component
│   │   │   └── CertificationInput.tsx # Certifications input
│   │   │
│   │   ├── talent-ingest/             # Talent Ingest components
│   │   │   ├── DropZone.tsx           # Drag-and-drop zone
│   │   │   ├── ProgressBar.tsx        # WebSocket progress bar
│   │   │   └── UploadQueue.tsx        # Upload queue manager
│   │   │
│   │   ├── pipeline/                  # Pipeline/Kanban components
│   │   │   ├── KanbanBoard.tsx        # Main kanban board
│   │   │   ├── KanbanColumn.tsx       # Column component
│   │   │   ├── CandidateCard.tsx      # Draggable candidate card
│   │   │   └── DragDropContext.tsx    # DnD context wrapper
│   │   │
│   │   ├── analytics/                 # Analytics/DAV components
│   │   │   ├── SkillGapRadar.tsx      # Skill-Gap Radar chart
│   │   │   ├── HiringFunnel.tsx       # Sankey diagram
│   │   │   ├── TalentHeatmap.tsx      # Heatmap visualization
│   │   │   ├── CandidateDeepDive.tsx  # Candidate analysis view
│   │   │   ├── BlindHiringToggle.tsx  # PII masking toggle
│   │   │   └── ScoreBreakdown.tsx     # Score breakdown visualization
│   │   │
│   │   └── shared/                    # Shared components
│   │       ├── Loading.tsx            # Shimmer/Skeleton loader
│   │       ├── AnimatedCard.tsx       # Card with Framer Motion
│   │       └── MagneticButton.tsx     # Magnetic hover button
│   │
│   ├── lib/                           # Utility libraries
│   │   ├── utils.ts                   # General utilities
│   │   ├── cn.ts                      # Tailwind class merger
│   │   ├── api.ts                     # API client functions
│   │   ├── websocket.ts               # WebSocket client
│   │   └── animations.ts              # Framer Motion variants
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useWebSocket.ts            # WebSocket hook
│   │   ├── useCommandPalette.ts      # Command palette hook
│   │   ├── useDragDrop.ts            # Drag and drop hook
│   │   └── useDebounce.ts            # Debounce hook
│   │
│   ├── types/                         # TypeScript types
│   │   ├── index.ts                   # Main type exports
│   │   ├── candidate.ts               # Candidate types
│   │   ├── job.ts                     # Job types
│   │   ├── analytics.ts               # Analytics types
│   │   └── api.ts                     # API response types
│   │
│   ├── styles/                        # Global styles
│   │   └── globals.css                # Tailwind + custom styles
│   │
│   └── public/                        # Static assets
│       ├── fonts/                     # Custom fonts (Geist Sans)
│       └── icons/                     # Static icons
│
├── backend/                           # Node.js/Express/TypeScript Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   │
│   ├── src/
│   │   ├── index.ts                   # Entry point
│   │   ├── app.ts                     # Express app setup
│   │   │
│   │   ├── config/                    # Configuration
│   │   │   ├── database.ts            # Prisma client config
│   │   │   ├── redis.ts               # Redis client config
│   │   │   ├── bullmq.ts              # BullMQ queue config
│   │   │   └── env.ts                 # Environment variables
│   │   │
│   │   ├── prisma/                    # Prisma schema & migrations
│   │   │   ├── schema.prisma          # Database schema
│   │   │   └── migrations/            # Migration files
│   │   │
│   │   ├── routes/                    # API routes
│   │   │   ├── index.ts               # Route aggregator
│   │   │   ├── auth.routes.ts         # Authentication routes
│   │   │   ├── jobs.routes.ts         # Job management routes
│   │   │   ├── candidates.routes.ts   # Candidate routes
│   │   │   ├── pipeline.routes.ts     # Pipeline/Kanban routes
│   │   │   ├── analytics.routes.ts   # Analytics routes
│   │   │   └── upload.routes.ts       # Resume upload routes
│   │   │
│   │   ├── controllers/               # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── jobs.controller.ts
│   │   │   ├── candidates.controller.ts
│   │   │   ├── pipeline.controller.ts
│   │   │   ├── analytics.controller.ts
│   │   │   └── upload.controller.ts
│   │   │
│   │   ├── services/                  # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── job.service.ts
│   │   │   ├── candidate.service.ts
│   │   │   ├── scoring.service.ts     # AI scoring logic
│   │   │   ├── analytics.service.ts   # Analytics calculations
│   │   │   └── encryption.service.ts  # AES-256-GCM encryption
│   │   │
│   │   ├── queues/                    # BullMQ job queues
│   │   │   ├── resume-processor.ts    # Resume processing queue
│   │   │   ├── embedding-generator.ts # Embedding generation queue
│   │   │   └── scoring-worker.ts      # Scoring worker
│   │   │
│   │   ├── workers/                   # Background workers
│   │   │   ├── resume.worker.ts       # Resume parsing worker
│   │   │   └── scoring.worker.ts      # Scoring worker
│   │   │
│   │   ├── middleware/                # Express middleware
│   │   │   ├── auth.middleware.ts     # JWT authentication
│   │   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   │   ├── audit.middleware.ts    # Audit trail logging
│   │   │   ├── error.middleware.ts    # Error handling
│   │   │   └── validation.middleware.ts # Request validation
│   │   │
│   │   ├── utils/                     # Utility functions
│   │   │   ├── logger.ts              # Centralized logging
│   │   │   ├── errors.ts              # Custom error classes
│   │   │   └── validators.ts          # Validation schemas
│   │   │
│   │   └── types/                     # TypeScript types
│   │       ├── express.d.ts            # Express type extensions
│   │       └── index.ts
│   │
│   └── tests/                         # Backend tests
│       ├── unit/
│       └── integration/
│
├── ai-service/                        # Python FastAPI AI Microservice
│   ├── requirements.txt               # Python dependencies
│   ├── Dockerfile                     # Docker image for AI service
│   ├── .env.example
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry
│   │   │
│   │   ├── api/                       # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── routes.py              # Route definitions
│   │   │   └── dependencies.py        # FastAPI dependencies
│   │   │
│   │   ├── services/                  # AI services
│   │   │   ├── __init__.py
│   │   │   ├── parser.py              # PyMuPDF resume parser
│   │   │   ├── embedding.py           # Sentence-Transformers embeddings
│   │   │   ├── matcher.py             # Semantic matching logic
│   │   │   └── scorer.py              # Scoring algorithm implementation
│   │   │
│   │   ├── models/                    # Data models
│   │   │   ├── __init__.py
│   │   │   ├── resume.py              # Resume data model
│   │   │   ├── job.py                 # Job description model
│   │   │   └── score.py               # Scoring result model
│   │   │
│   │   └── utils/                     # Utilities
│   │       ├── __init__.py
│   │       ├── nlp.py                 # NLP utilities (date normalization, skill extraction)
│   │       └── cosine.py              # Cosine similarity calculations
│   │
│   └── tests/                         # Python tests
│       ├── test_parser.py
│       ├── test_embedding.py
│       └── test_scorer.py
│
├── shared/                            # Shared code/configs
│   ├── types/                         # Shared TypeScript types
│   │   └── index.ts
│   └── constants/                    # Shared constants
│       └── index.ts
│
└── scripts/                           # Utility scripts
    ├── setup.sh                       # Initial setup script
    ├── migrate.sh                     # Database migration script
    └── seed.ts                        # Database seeding script
```

## Technology Stack Summary

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide Icons
- **Charts**: Recharts
- **UI Components**: Shadcn UI
- **State Management**: React Server Components + Client Components

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (with pgvector extension)
- **Queue**: BullMQ
- **Cache**: Redis
- **Authentication**: JWT

### AI Service
- **Framework**: FastAPI (Python)
- **PDF Parsing**: PyMuPDF
- **Embeddings**: Sentence-Transformers
- **NLP**: spaCy (for skill extraction)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2 (for production)
- **Monitoring**: (To be added)

## Key Features Implementation

1. **Semantic Search**: pgvector for PostgreSQL vector similarity search
2. **Async Processing**: BullMQ queues for handling 10,000+ resume uploads
3. **Real-time Updates**: WebSocket for progress tracking
4. **Security**: AES-256-GCM encryption for stored resumes
5. **Audit Trail**: Comprehensive logging of all status changes
6. **Blind Hiring**: PII masking for bias-free review
