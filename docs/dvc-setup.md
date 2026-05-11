# DVC Setup Guide

## Installation

```bash
pip install dvc[s3]==3.50.0
```

---

## Initialize DVC in the Project

```bash
# From project root
git init  # if not already a git repo
dvc init
git add .dvc .dvcignore
git commit -m "chore: initialize DVC"
```

---

## Configure S3 Remote Storage

```bash
# Add S3 as the default DVC remote
dvc remote add -d myremote s3://ai-email-reply-storage/dvc

# Set AWS credentials (or use environment variables)
dvc remote modify myremote access_key_id YOUR_AWS_ACCESS_KEY
dvc remote modify myremote secret_access_key YOUR_AWS_SECRET_KEY
dvc remote modify myremote region us-east-1

git add .dvc/config
git commit -m "chore: configure DVC S3 remote"
```

---

## Track Dataset

```bash
# Add the raw dataset to DVC tracking
dvc add ml-server/data/email_dataset.csv

# This creates ml-server/data/email_dataset.csv.dvc
git add ml-server/data/email_dataset.csv.dvc ml-server/data/.gitignore
git commit -m "data: add email dataset tracking"

# Push data to S3
dvc push
```

---

## Track Model Artifacts

```bash
# After training, track the model
dvc add ml-server/models/email_reply_model.pkl

git add ml-server/models/email_reply_model.pkl.dvc ml-server/models/.gitignore
git commit -m "model: add trained model v1.0"

dvc push
```

---

## Run the Full DVC Pipeline

```bash
# Run all stages defined in dvc.yaml
dvc repro

# Run a specific stage
dvc repro prepare
dvc repro train
dvc repro evaluate
```

---

## Pull Data on a New Machine

```bash
git clone https://github.com/your-org/ai-email-reply-generator.git
cd ai-email-reply-generator

# Configure AWS credentials
aws configure

# Pull all DVC-tracked files
dvc pull

# Or pull specific files
dvc pull ml-server/models/email_reply_model.pkl
```

---

## Experiment Versioning

```bash
# Create an experiment with different params
dvc exp run --set-param train.learning_rate=1e-4

# List experiments
dvc exp show

# Compare experiments
dvc metrics diff

# Apply the best experiment
dvc exp apply <exp-name>
```

---

## Useful DVC Commands

```bash
dvc status          # Check what has changed
dvc diff            # Show data/model differences
dvc dag             # Visualize the pipeline DAG
dvc params diff     # Compare parameter changes
dvc plots show      # Visualize metrics plots
```
