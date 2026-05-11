#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# init-git.sh — Initialize Git + DVC for the project
# Run once after cloning: bash scripts/init-git.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

echo "==> Initializing Git repository..."
git init
git add .
git commit -m "chore: initial project scaffold"

echo ""
echo "==> Installing DVC..."
pip install "dvc[s3]==3.50.0"

echo ""
echo "==> Initializing DVC..."
dvc init

echo ""
echo "==> Configuring DVC S3 remote..."
read -rp "Enter your S3 bucket name [ai-email-reply-storage]: " BUCKET
BUCKET="${BUCKET:-ai-email-reply-storage}"
dvc remote add -d myremote "s3://${BUCKET}/dvc"

echo ""
echo "==> Creating placeholder dataset file..."
mkdir -p ml-server/data
touch ml-server/data/email_dataset.csv
echo "email,reply" >> ml-server/data/email_dataset.csv

dvc add ml-server/data/email_dataset.csv

echo ""
echo "==> Committing DVC config..."
git add .dvc/ .dvcignore ml-server/data/.gitignore ml-server/data/email_dataset.csv.dvc
git commit -m "chore: initialize DVC with S3 remote"

echo ""
echo "✓ Git + DVC initialized successfully."
echo ""
echo "Next steps:"
echo "  1. Replace ml-server/data/email_dataset.csv with your real dataset"
echo "  2. Run: dvc push"
echo "  3. Copy .env.example files and fill in your credentials"
echo "  4. Run: make dev-up"
