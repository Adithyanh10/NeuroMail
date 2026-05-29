# Run Commands — Step by Step

## Environment: Python 3.13 · Node 24 · Windows (no Docker required for local dev)

---

## 1. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Copy environment file
copy .env.example .env
# Edit .env and set:
#   SECRET_KEY=your-secret-key-here
#   DATABASE_URL=sqlite+aiosqlite:///./dev.db
#   ML_SERVER_URL=http://localhost:8001

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: **http://localhost:8000**  
API docs: **http://localhost:8000/docs**

---

## 2. ML Server Setup (FastAPI + sklearn)

```bash
cd ml-server

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Copy environment file
copy .env.example .env

# Train the model (first time only)
python -m app.model.trainer

# Start the ML server
uvicorn app.main:app --reload --port 8001
```

ML Server will be available at: **http://localhost:8001**  
Health check: **http://localhost:8001/health**

---

## 3. Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.local.example .env.local
# Edit .env.local and set:
#   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start the development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

---

## 4. Running Tests

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### ML Server Tests
```bash
cd ml-server
pytest tests/ -v
```

### Frontend Lint
```bash
cd frontend
npm run lint
```

---

## 5. Docker Compose (All Services)

```bash
cd docker
docker-compose up --build
```

This starts:
- Backend: **http://localhost:8000**
- ML Server: **http://localhost:8001**
- Frontend: **http://localhost:3000** (if included in compose)

---

## 6. Database Management

### Create a new migration
```bash
cd backend
alembic revision -m "description of changes"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback one migration
```bash
alembic downgrade -1
```

### Reset database (SQLite dev only)
```bash
# Delete the database file
del dev.db
# Re-run migrations
alembic upgrade head
```

---

## 7. DVC (Data Version Control)

### Pull model and data
```bash
dvc pull
```

### Track new model version
```bash
dvc add ml-server/models/email_reply_model.pkl
git add ml-server/models/email_reply_model.pkl.dvc
git commit -m "Update model"
dvc push
```

---

## 8. Production Deployment

### Backend (AWS EC2)
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Pull latest code
git pull origin main

# Restart service
sudo systemctl restart email-backend
```

### Frontend (Vercel)
```bash
# Push to main branch — auto-deploys via GitHub Actions
git push origin main
```

---

## 9. Useful Commands

### Lint backend code
```bash
cd backend
ruff check app/
```

### Format backend code
```bash
ruff format app/
```

### Build frontend for production
```bash
cd frontend
npm run build
npm run start
```

### Check ML model info
```bash
cd ml-server
python -c "import pickle; m = pickle.load(open('models/email_reply_model.pkl', 'rb')); print(m.keys())"
```

---

## 10. Demo Account

**Email:** `demo@aimail.com`  
**Password:** `Demo@1234`

Use this account to test the application without registering.

---

## Troubleshooting

### Backend won't start
- Check `.env` file exists and has valid values
- Ensure database migrations are applied: `alembic upgrade head`
- Check port 8000 is not already in use

### ML Server won't start
- Ensure model file exists: `ml-server/models/email_reply_model.pkl`
- If missing, train the model: `python -m app.model.trainer`
- Check port 8001 is not already in use

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.local` points to `http://localhost:8000/api/v1`
- Ensure backend is running on port 8000
- Check browser console for CORS errors

### Tests failing
- Ensure test database is clean (delete `test*.db` files)
- Install dev dependencies: `pip install -r requirements-dev.txt`
- Check all environment variables are set in `conftest.py`

---

## Quick Start (All Services)

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — ML Server
cd ml-server
venv\Scripts\activate
uvicorn app.main:app --reload --port 8001

# Terminal 3 — Frontend
cd frontend
npm run dev
```

Then open **http://localhost:3000** and log in with the demo account.
