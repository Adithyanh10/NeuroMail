"""
ML Training Pipeline for Email Reply Generator
Uses the email_dataset_2.0.csv to train a multi-output classifier + reply retrieval system.

Architecture:
  - Category classifier    (TF-IDF + LogisticRegression)
  - Priority classifier    (TF-IDF + LogisticRegression)
  - Tone classifier        (TF-IDF + LogisticRegression)
  - Sentiment analyzer     (TextBlob / rule-based)
  - Reply retrieval engine (cosine similarity over TF-IDF vectors)
  - Template augmentation  (fills in customer_name, subject context)
"""

import json
import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder


# ─── Paths ────────────────────────────────────────────────────────────────────

_HERE = Path(__file__).resolve().parent.parent.parent  # ml-server/

DATA_PATH   = Path(os.getenv("DATA_PATH",  str(_HERE / "data"    / "email_dataset_2.0.csv")))
MODEL_DIR   = Path(os.getenv("MODEL_DIR",  str(_HERE / "models")))
METRICS_DIR = Path(os.getenv("METRICS_DIR",str(_HERE / "metrics")))

MODEL_DIR.mkdir(parents=True, exist_ok=True)
METRICS_DIR.mkdir(parents=True, exist_ok=True)


# ─── Feature engineering ──────────────────────────────────────────────────────

def build_features(df: pd.DataFrame) -> pd.Series:
    """
    Combine subject + email_input into a single text feature.
    This gives classifiers both the topic context and the message body.
    """
    return df["subject"].fillna("") + " [SEP] " + df["email_input"].fillna("")


# ─── Training ─────────────────────────────────────────────────────────────────

def train_classifier(X_train, y_train, label: str) -> Pipeline:
    """Train a TF-IDF + LogisticRegression pipeline for a single label."""
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True,
            strip_accents="unicode",
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver="lbfgs",
        )),
    ])
    pipe.fit(X_train, y_train)
    print(f"  ✓ {label} classifier trained")
    return pipe


def train_reply_retrieval(df: pd.DataFrame) -> dict:
    """
    Build a TF-IDF matrix over all training replies for similarity-based retrieval.
    Returns a dict with the vectorizer, matrix, and reply corpus.
    """
    from sklearn.metrics.pairwise import cosine_similarity

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=8000, sublinear_tf=True)
    features   = build_features(df)
    tfidf_matrix = vectorizer.fit_transform(features)

    return {
        "vectorizer":   vectorizer,
        "tfidf_matrix": tfidf_matrix,
        "replies":      df["email_reply"].tolist(),
        "categories":   df["category"].tolist(),
        "tones":        df["tone"].tolist(),
        "priorities":   df["priority"].tolist(),
        "subjects":     df["subject"].tolist(),
    }


# ─── Main training entry point ────────────────────────────────────────────────

def run_training() -> dict:
    """
    Full training pipeline. Returns a metrics dict.
    Saves all model artifacts to MODEL_DIR.
    """
    print(f"\n{'='*60}")
    print("  AI Email Reply Generator — Training Pipeline")
    print(f"{'='*60}\n")

    # 1. Load data
    print(f"[1/6] Loading dataset from {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=["email_input", "email_reply", "category", "tone", "priority"])
    print(f"      Loaded {len(df)} samples")
    print(f"      Categories : {df['category'].unique().tolist()}")
    print(f"      Tones      : {df['tone'].unique().tolist()}")
    print(f"      Priorities : {df['priority'].unique().tolist()}")

    # 2. Feature engineering
    print("\n[2/6] Engineering features")
    X = build_features(df)

    # 3. Train/test split
    print("\n[3/6] Splitting data (80/20)")
    X_train, X_test, idx_train, idx_test = train_test_split(
        X, df.index, test_size=0.2, random_state=42, stratify=df["category"]
    )
    df_train = df.loc[idx_train]
    df_test  = df.loc[idx_test]
    print(f"      Train: {len(X_train)}  |  Test: {len(X_test)}")

    # 4. Train classifiers
    print("\n[4/6] Training classifiers")
    category_clf = train_classifier(X_train, df_train["category"], "Category")
    tone_clf     = train_classifier(X_train, df_train["tone"],     "Tone")
    priority_clf = train_classifier(X_train, df_train["priority"], "Priority")

    # 5. Train reply retrieval engine
    print("\n[5/6] Building reply retrieval engine")
    retrieval_engine = train_reply_retrieval(df_train)
    print("      ✓ Retrieval engine built")

    # 6. Evaluate
    print("\n[6/6] Evaluating on test set")
    metrics = {}

    for name, clf, y_true in [
        ("category", category_clf, df_test["category"]),
        ("tone",     tone_clf,     df_test["tone"]),
        ("priority", priority_clf, df_test["priority"]),
    ]:
        y_pred = clf.predict(X_test)
        report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
        acc = report["accuracy"]
        metrics[f"{name}_accuracy"] = round(acc, 4)
        print(f"      {name.capitalize()} accuracy: {acc:.2%}")

    # 7. Save artifacts
    artifacts = {
        "category_clf":     category_clf,
        "tone_clf":         tone_clf,
        "priority_clf":     priority_clf,
        "retrieval_engine": retrieval_engine,
        "label_encoders":   {},
        "version":          "2.0",
        "dataset":          str(DATA_PATH),
        "train_samples":    len(X_train),
        "test_samples":     len(X_test),
    }

    model_path = MODEL_DIR / "email_reply_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(artifacts, f)
    print(f"\n✓ Model saved → {model_path}")

    # Save metrics
    metrics["train_samples"] = len(X_train)
    metrics["test_samples"]  = len(X_test)
    metrics["version"]       = "2.0"

    metrics_path = METRICS_DIR / "eval_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"✓ Metrics saved → {metrics_path}")

    print(f"\n{'='*60}")
    print("  Training complete!")
    print(f"{'='*60}\n")

    return metrics


if __name__ == "__main__":
    run_training()
