"""
Model evaluation script.
Run via DVC: dvc repro evaluate
"""

import json
import pickle
from pathlib import Path

import pandas as pd

TEST_FILE = Path("ml-server/data/test.csv")
MODEL_FILE = Path("ml-server/models/email_reply_model.pkl")
METRICS_OUT = Path("ml-server/metrics/eval_metrics.json")

METRICS_OUT.parent.mkdir(parents=True, exist_ok=True)


def main():
    print(f"Loading test data from {TEST_FILE}")
    df = pd.read_csv(TEST_FILE)

    print(f"Loading model from {MODEL_FILE}")
    with open(MODEL_FILE, "rb") as f:
        model = pickle.load(f)

    # ── Replace with real evaluation metrics (BLEU, ROUGE, etc.) ──────────────
    correct = 0
    total = len(df)

    for _, row in df.iterrows():
        email_content = str(row.get("email", ""))
        result = model.generate(email_content, "professional")
        if result.get("reply"):
            correct += 1

    accuracy = correct / total if total > 0 else 0.0
    metrics = {"test_samples": total, "reply_rate": accuracy}

    with open(METRICS_OUT, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Evaluation complete. Metrics: {metrics}")
    print(f"Saved to {METRICS_OUT}")


if __name__ == "__main__":
    main()
