# ─── AI Email Reply Generator — Developer Makefile ───────────────────────────
# Usage: make <target>

.PHONY: help setup dev-up dev-down backend-test ml-test lint-backend lint-ml \
        dvc-init dvc-push dvc-pull migrate

help:
	@echo ""
	@echo "  setup          Install all dependencies (backend + frontend + ml-server)"
	@echo "  dev-up         Start all services with Docker Compose"
	@echo "  dev-down       Stop all Docker Compose services"
	@echo "  backend-test   Run backend test suite"
	@echo "  ml-test        Run ML server test suite"
	@echo "  lint-backend   Lint backend with ruff"
	@echo "  lint-ml        Lint ml-server with ruff"
	@echo "  migrate        Run Alembic database migrations"
	@echo "  dvc-init       Initialize DVC and configure S3 remote"
	@echo "  dvc-push       Push data/models to DVC remote"
	@echo "  dvc-pull       Pull data/models from DVC remote"
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────────────────

setup:
	cd backend && pip install -r requirements.txt
	cd ml-server && pip install -r requirements.txt
	cd frontend && npm install

# ── Docker ────────────────────────────────────────────────────────────────────

dev-up:
	docker-compose -f docker/docker-compose.yml up --build

dev-down:
	docker-compose -f docker/docker-compose.yml down

# ── Tests ─────────────────────────────────────────────────────────────────────

backend-test:
	cd backend && pytest tests/ -v

ml-test:
	cd ml-server && pytest tests/ -v

# ── Linting ───────────────────────────────────────────────────────────────────

lint-backend:
	cd backend && ruff check app/

lint-ml:
	cd ml-server && ruff check app/

# ── Database ──────────────────────────────────────────────────────────────────

migrate:
	cd backend && alembic upgrade head

# ── DVC ───────────────────────────────────────────────────────────────────────

dvc-init:
	dvc init
	dvc remote add -d myremote s3://ai-email-reply-storage/dvc
	@echo "DVC initialized. Set AWS credentials in .dvc/config or environment."

dvc-push:
	dvc push

dvc-pull:
	dvc pull
