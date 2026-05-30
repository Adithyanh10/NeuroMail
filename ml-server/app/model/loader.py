"""
Model loading utilities.
Loads the trained email reply model artifacts from disk.
"""

import os
import pickle
from pathlib import Path
from typing import Any

# Resolve MODEL_PATH relative to this file's location so it works regardless
# of the working directory the server is launched from.
_HERE = Path(__file__).resolve().parent.parent.parent  # ml-server/
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(_HERE / "models" / "email_reply_model.pkl")))


def load_model() -> Any:
    """
    Load the serialized model artifacts from MODEL_PATH.
    Falls back to FallbackEmailGenerator if model file is not found.
    """
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            artifacts = pickle.load(f)
        print(f"✓ Loaded trained model v{artifacts.get('version','?')} from {MODEL_PATH}")
        return TrainedEmailModel(artifacts)

    print(f"⚠ Model not found at {MODEL_PATH}. Using fallback generator.")
    print("  Run: python -m ml-server.app.model.trainer  to train the model.")
    return FallbackEmailGenerator()


# ─── Trained Model Wrapper ────────────────────────────────────────────────────

class TrainedEmailModel:
    """
    Wraps the trained sklearn artifacts and exposes a unified .generate() interface.
    """

    def __init__(self, artifacts: dict):
        self.category_clf     = artifacts["category_clf"]
        self.tone_clf         = artifacts["tone_clf"]
        self.priority_clf     = artifacts["priority_clf"]
        self.retrieval_engine = artifacts["retrieval_engine"]
        self.version          = artifacts.get("version", "2.0")

    def generate(self, email_content: str, tone: str, subject: str = "") -> dict:
        """
        Generate a reply using:
          1. Classify category, predicted tone, priority
          2. Retrieve the most similar reply from training corpus
          3. Apply tone override if user specified one
          4. Return structured result
        """
        from sklearn.metrics.pairwise import cosine_similarity

        feature_text = f"{subject} [SEP] {email_content}" if subject else email_content

        # ── Predictions ───────────────────────────────────────────────────────
        try:
            predicted_category = self.category_clf.predict([feature_text])[0]
            predicted_priority = self.priority_clf.predict([feature_text])[0]

            cat_proba = self.category_clf.predict_proba([feature_text])[0]
            confidence = float(max(cat_proba))

        except Exception as e:
            print(f"ML prediction failed: {e}")

            predicted_category = "General"
            predicted_priority = "Medium"
            confidence = 0.60

        # ── Retrieval ─────────────────────────────────────────────────────────
        engine = self.retrieval_engine

        

        # ── Retrieval ─────────────────────────────────────────────────────────
        try:
            engine = self.retrieval_engine

            query_vec = engine["vectorizer"].transform([feature_text])
            sims = cosine_similarity(query_vec, engine["tfidf_matrix"]).flatten()

            category_mask = [
                1.0 if c == predicted_category else 0.3
                for c in engine["categories"]
            ]

            weighted_sims = sims * category_mask
            best_idx = int(weighted_sims.argmax())

            raw_reply = engine["replies"][best_idx]

        except Exception as e:
            print(f"Retrieval failed: {e}")

            raw_reply = (
                "Thank you for your email. I have reviewed your message and "
                "will respond shortly. Please let me know if you need any "
                "additional assistance."
            )

        # ── Tone adaptation ───────────────────────────────────────────────────
        adapted_reply = _adapt_tone(raw_reply, tone)

        return {
            "reply":              adapted_reply,
            "confidence":         round(confidence, 4),
            "predicted_category": predicted_category,
            "predicted_priority": predicted_priority,
            "tone_applied":       tone,
            "model_version":      self.version,
        }


def _adapt_tone(reply: str, tone: str) -> str:
    """
    Lightly adapt the retrieved reply to match the requested tone.
    """
    tone = tone.lower()

    if tone == "formal":
        reply = reply.replace("Hi,", "Dear Sir/Madam,")
        reply = reply.replace("Hey!", "Dear Customer,")
        reply = reply.replace("Thanks", "Thank you")
        if not reply.strip().endswith((".", "!", "?")):
            reply = reply.strip() + "."
        reply = reply + "\n\nYours sincerely,\nCustomer Support Team"

    elif tone == "friendly":
        reply = reply.replace("Dear Sir/Madam,", "Hey there!")
        reply = reply.replace("Dear Customer,", "Hi!")
        reply = reply.replace("Thank you for reaching out.", "Thanks so much for getting in touch!")
        reply = reply + "\n\nFeel free to reach out anytime! 😊"

    elif tone == "professional":
        reply = reply.replace("Hey!", "Hello,")
        reply = reply.replace("Hi,", "Hello,")
        if not reply.strip().endswith((".", "!", "?")):
            reply = reply.strip() + "."
        reply = reply + "\n\nBest regards,\nCustomer Support Team"

    return reply


# ─── Fallback Generator ───────────────────────────────────────────────────────

class FallbackEmailGenerator:
    """
    Template-based fallback used when no trained model is present.
    """

    TEMPLATES = {
        "professional": (
            "Thank you for your email. I have reviewed your message and will "
            "provide a comprehensive response shortly. Please feel free to reach "
            "out if you require any immediate assistance.\n\n"
            "Best regards,\nCustomer Support Team"
        ),
        "formal": (
            "Dear Sir/Madam,\n\nThank you for your correspondence. I acknowledge "
            "receipt of your message and shall respond in due course.\n\n"
            "Yours sincerely,\nCustomer Support Team"
        ),
        "friendly": (
            "Hey! Thanks so much for reaching out. I got your message and I'll "
            "get back to you as soon as I can. Talk soon! 😊"
        ),
    }

    def generate(self, email_content: str, tone: str, subject: str = "") -> dict:
        reply = self.TEMPLATES.get(tone, self.TEMPLATES["professional"])
        return {
            "reply":              reply,
            "confidence":         0.60,
            "predicted_category": "General",
            "predicted_priority": "Medium",
            "tone_applied":       tone,
            "model_version":      "fallback",
        }
