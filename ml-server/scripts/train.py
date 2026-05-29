"""
Training entry point — run from project root:
  python ml-server/scripts/train.py
"""
import sys
from pathlib import Path

# Add ml-server to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.model.trainer import run_training

if __name__ == "__main__":
    metrics = run_training()
    print("\nFinal Metrics:")
    for k, v in metrics.items():
        if k != "full_report":
            print(f"  {k}: {v}")
