"""
Data preparation script — cleans and splits email_dataset_2.0.csv
Run via DVC: dvc repro prepare
"""

import sys
from pathlib import Path
import pandas as pd
import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

# Load params
with open("params.yaml") as f:
    params = yaml.safe_load(f)["prepare"]

TEST_SIZE   = params["test_size"]
RANDOM_SEED = params["random_seed"]

DATA_DIR  = Path("ml-server/data")
RAW_FILE  = DATA_DIR / "email_dataset_2.0.csv"
TRAIN_FILE = DATA_DIR / "train.csv"
TEST_FILE  = DATA_DIR / "test.csv"


def main():
    print(f"Loading dataset from {RAW_FILE}")
    df = pd.read_csv(RAW_FILE)
    df = df.dropna(subset=["email_input", "email_reply", "category", "tone", "priority"])

    print(f"Total clean samples: {len(df)}")
    print(f"Category distribution:\n{df['category'].value_counts()}")
    print(f"Tone distribution:\n{df['tone'].value_counts()}")
    print(f"Priority distribution:\n{df['priority'].value_counts()}")

    df = df.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
    split_idx = int(len(df) * (1 - TEST_SIZE))
    train_df = df.iloc[:split_idx]
    test_df  = df.iloc[split_idx:]

    train_df.to_csv(TRAIN_FILE, index=False)
    test_df.to_csv(TEST_FILE, index=False)

    print(f"\nTrain: {len(train_df)} samples → {TRAIN_FILE}")
    print(f"Test:  {len(test_df)} samples  → {TEST_FILE}")


if __name__ == "__main__":
    main()
