# AI Email Reply Generator API

A professional AI-powered email reply generation system that automatically creates context-aware and professional responses for incoming emails using NLP/LLM models.

---

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [ML Server Integration](#ml-server-integration)
- [Docker Setup](#docker-setup)
- [AWS Deployment](#aws-deployment)
- [S3 Integration](#s3-integration)
- [DVC Setup](#dvc-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## Project Overview

This system accepts incoming email content, processes it through an NLP/LLM model, and returns a professional, context-aware reply. Users can select the tone of the reply (Professional, Formal, Friendly), save generated replies, and view their email history.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                        │
│                    Next.js + React.js App                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS REST API
┌───────────────────────────▼─────────────────────────────────────┐
│                   BACKEND (AWS EC2 t3.micro)                    │
│                       FastAPI Server                            │
│   /register  /login  /generate-reply  /history  /upload        │
└──────┬──────────────────────────────────────┬───────────────────┘
       │ Supabase / AWS RDS                   │ Internal HTTP
       │ (PostgreSQL)                         │
┌──────▼──────────┐                ┌──────────▼──────────────────┐
│   Database      │                │   ML Server (Docker)        │
│   Supabase      │                │   NLP Inference Service     │
│   PostgreSQL    │                │   /predict endpoint         │
└─────────────────┘                └─────────────────────────────┘
       │
┌──────▼──────────┐
│   AWS S3 Bucket │
│   File Storage  │
└─────────────────┘
```

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React.js, Next.js                 |
| Backend     | FastAPI (Python)                  |
| Database    | Supabase (PostgreSQL) / AWS RDS   |
| Auth        | JWT Tokens                        |
| Storage     | AWS S3 Bucket                     |
| ML Server   | Docker + FastAPI (NLP inference)  |
| Frontend CD | Vercel                            |
| Backend CD  | AWS EC2 t3.micro                  |
| CI/CD       | GitHub Actions                    |
| Versioning  | Git + DVC                         |

---

## Folder Structure

```
ai-email-reply-generator/
├── frontend/                   # Next.js + React.js application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # Reusable React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions and API client
│   │   ├── store/              # State management
│   │   └── types/              # TypeScript type definitions
│   ├── public/
│   ├── .env.local.example
│   ├── next.config.js
│   └── package.json
│
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/                # Route handlers
│   │   ├── core/               # Config, security, dependencies
│   │   ├── models/             # SQLAlchemy / Pydantic models
│   │   ├── services/           # Business logic
│   │   └── main.py
│   ├── tests/
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml-server/                  # Dockerized ML inference service
│   ├── app/
│   │   ├── model/              # Model loading and inference
│   │   ├── api/                # Prediction endpoints
│   │   └── main.py
│   ├── models/                 # Saved model artifacts (DVC tracked)
│   ├── data/                   # Dataset (DVC tracked)
│   ├── notebooks/              # Jupyter notebooks for experiments
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker/                     # Docker Compose configurations
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── ml-server-ci.yml
│
├── .dvc/                       # DVC configuration
├── .dvcignore
├── dvc.yaml                    # DVC pipeline definition
├── params.yaml                 # DVC experiment parameters
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- AWS CLI configured
- Git + DVC installed

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/your-org/ai-email-reply-generator.git
cd ai-email-reply-generator
```

**2. Start all services with Docker Compose**
```bash
cd docker
docker-compose up --build
```

**3. Frontend (standalone)**
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

**4. Backend (standalone)**
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**5. ML Server (standalone)**
```bash
cd ml-server
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Endpoints

| Method | Endpoint           | Auth Required | Description                    |
|--------|--------------------|---------------|--------------------------------|
| POST   | /register          | No            | Register a new user            |
| POST   | /login             | No            | Login and receive JWT token    |
| POST   | /generate-reply    | Yes           | Generate AI email reply        |
| GET    | /history           | Yes           | Get user's email reply history |
| POST   | /upload            | Yes           | Upload email file to S3        |
| GET    | /health            | No            | Health check                   |

---

## Database Schema

### users
| Column       | Type      | Constraints          |
|--------------|-----------|----------------------|
| id           | UUID      | PK, default gen      |
| email        | VARCHAR   | UNIQUE, NOT NULL     |
| username     | VARCHAR   | NOT NULL             |
| password     | VARCHAR   | NOT NULL (hashed)    |
| created_at   | TIMESTAMP | default now()        |
| updated_at   | TIMESTAMP | default now()        |

### email_history
| Column         | Type      | Constraints          |
|----------------|-----------|----------------------|
| id             | UUID      | PK, default gen      |
| user_id        | UUID      | FK → users.id        |
| original_email | TEXT      | NOT NULL             |
| generated_reply| TEXT      | NOT NULL             |
| tone           | VARCHAR   | NOT NULL             |
| s3_key         | VARCHAR   | nullable             |
| created_at     | TIMESTAMP | default now()        |

---

## Authentication Flow

```
1. User registers → POST /register → password hashed with bcrypt → stored in DB
2. User logs in  → POST /login   → credentials verified → JWT token issued (24h expiry)
3. Protected routes → Bearer token in Authorization header → JWT middleware validates
4. Token expired   → 401 Unauthorized → user must re-login
```

---

## ML Server Integration

```
FastAPI Backend  →  POST http://ml-server:8001/predict
                    Body: { "email_content": "...", "tone": "professional" }
                 ←  Response: { "reply": "...", "confidence": 0.95 }
```

---

## Docker Setup

```bash
# Development
docker-compose -f docker/docker-compose.yml up --build

# Production
docker-compose -f docker/docker-compose.prod.yml up -d
```

---

## AWS Deployment

### EC2 Backend Deployment
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start

# Pull and run backend
docker pull your-registry/email-backend:latest
docker run -d -p 8000:8000 --env-file .env your-registry/email-backend:latest
```

### S3 Bucket Setup
```bash
aws s3 mb s3://ai-email-reply-storage
aws s3api put-bucket-versioning --bucket ai-email-reply-storage --versioning-configuration Status=Enabled
```

---

## DVC Setup

```bash
# Initialize DVC
dvc init

# Add remote storage (S3)
dvc remote add -d myremote s3://ai-email-reply-storage/dvc

# Track dataset
dvc add ml-server/data/email_dataset.csv

# Track model
dvc add ml-server/models/email_reply_model.pkl

# Push to remote
dvc push

# Pull data on new machine
dvc pull
```

---

## CI/CD Pipeline

GitHub Actions workflows are triggered on push to `main` and `develop` branches:

- **backend-ci.yml**: Lint → Test → Build Docker → Push to ECR → Deploy to EC2
- **frontend-ci.yml**: Lint → Test → Build → Deploy to Vercel
- **ml-server-ci.yml**: Lint → Test → Build Docker → Push to ECR

---

## Environment Variables

See `.env.example` files in each service directory for required variables.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.
