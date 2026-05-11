"""
Model training script — uses email_dataset_2.0.csv
Run directly:  python ml-server/scripts/train.py
Run via DVC:   dvc repro train
"""

import sys
from pathlib import Path

# Allow running from project root
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ml_server.app.model.trainer import run_training

if __name__ == "__main__":
    metrics = run_training()
    print("\nFinal metrics:")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
