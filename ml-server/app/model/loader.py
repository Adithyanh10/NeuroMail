"""
Model loading utilities — v3.0
Loads trained artifacts and exposes a unified .generate() interface.
"""

import os
import pickle
import re
from pathlib import Path
from typing import Any

from sklearn.metrics.pairwise import cosine_similarity

MODEL_PATH = Path(os.getenv("MODEL_PATH", "ml-server/models/email_reply_model.pkl"))


def load_model() -> Any:
    """
    Load the serialized model artifacts from MODEL_PATH.
    Falls back to FallbackEmailGenerator if model file is not found.
    """
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            artifacts = pickle.load(f)
        version = artifacts.get("version", "?")
        print(f"✓ Loaded trained model v{version} from {MODEL_PATH}")
        return TrainedEmailModel(artifacts)

    print(f"⚠ Model not found at {MODEL_PATH}. Using fallback generator.")
    print("  Run: python -m ml-server.scripts.train  to train the model.")
    return FallbackEmailGenerator()


# ─── Trained Model Wrapper ────────────────────────────────────────────────────

class TrainedEmailModel:
    """
    Wraps v3.0 trained artifacts with per-category retrieval.
    """

    def __init__(self, artifacts: dict):
        self.category_clf       = artifacts["category_clf"]
        self.tone_clf           = artifacts["tone_clf"]
        self.priority_clf       = artifacts["priority_clf"]
        self.category_indices   = artifacts.get("category_indices", {})
        self.retrieval_engine   = artifacts.get("retrieval_engine", {})
        self.category_templates = artifacts.get("category_templates", {})
        self.version            = artifacts.get("version", "3.0")

    def generate(self, email_content: str, tone: str, subject: str = "",
                 customer_name: str = "Customer") -> dict:
        """
        Generate a reply using:
          1. Classify category, tone, priority
          2. Retrieve best reply from per-category index
          3. Personalize with customer name + tone
          4. Fall back to template if retrieval confidence is low
        """
        feature_text = f"{subject} [SEP] {email_content}" if subject else email_content
        feature_clean = feature_text.lower().strip()

        # ── Predictions ───────────────────────────────────────────────────────
        predicted_category = self.category_clf.predict([feature_clean])[0]
        predicted_priority = self.priority_clf.predict([feature_clean])[0]

        # Confidence from calibrated probabilities
        cat_proba  = self.category_clf.predict_proba([feature_clean])[0]
        confidence = float(max(cat_proba))

        # Use requested tone if valid, else use predicted
        valid_tones = {"polite", "formal", "professional", "friendly"}
        effective_tone = tone if tone.lower() in valid_tones else "Polite"
        # Map frontend tones to dataset tones
        tone_map = {"professional": "Polite", "friendly": "Polite", "formal": "Formal"}
        dataset_tone = tone_map.get(tone.lower(), "Polite")

        # ── Per-category retrieval ────────────────────────────────────────────
        reply = None
        retrieval_score = 0.0

        if predicted_category in self.category_indices:
            idx = self.category_indices[predicted_category]
            query_vec = idx["vectorizer"].transform([feature_clean])
            sims = cosine_similarity(query_vec, idx["tfidf_matrix"]).flatten()

            # Filter by matching tone for better reply quality
            tone_mask = [
                1.2 if t.lower() == dataset_tone.lower() else 0.8
                for t in idx["tones"]
            ]
            weighted_sims = sims * tone_mask
            best_idx = int(weighted_sims.argmax())
            retrieval_score = float(sims[best_idx])

            if retrieval_score > 0.05:  # minimum similarity threshold
                raw_reply = idx["replies"][best_idx]
                reply = _personalize_reply(raw_reply, customer_name, dataset_tone)

        # ── Global fallback retrieval ─────────────────────────────────────────
        if reply is None and self.retrieval_engine:
            engine = self.retrieval_engine
            query_vec = engine["vectorizer"].transform([feature_clean])
            sims = cosine_similarity(query_vec, engine["tfidf_matrix"]).flatten()
            cat_mask = [
                1.3 if c == predicted_category else 0.5
                for c in engine["categories"]
            ]
            weighted_sims = sims * cat_mask
            best_idx = int(weighted_sims.argmax())
            retrieval_score = float(sims[best_idx])
            raw_reply = engine["replies"][best_idx]
            reply = _personalize_reply(raw_reply, customer_name, dataset_tone)

        # ── Template fallback ─────────────────────────────────────────────────
        if reply is None or retrieval_score < 0.02:
            reply = _get_template_reply(
                self.category_templates, predicted_category, dataset_tone, customer_name
            )
            confidence = max(0.55, confidence)

        return {
            "reply":              reply,
            "confidence":         round(confidence, 4),
            "predicted_category": predicted_category,
            "predicted_priority": predicted_priority,
            "tone_applied":       tone,
            "model_version":      self.version,
            "retrieval_score":    round(retrieval_score, 4),
        }


def _personalize_reply(reply: str, customer_name: str, tone: str) -> str:
    """Inject customer name and apply tone formatting."""
    name = str(customer_name).strip() if customer_name else "Valued Customer"
    first_name = name.split()[0] if name else "Customer"

    # Replace placeholders
    for placeholder in ["[Customer Name]", "[customer name]", "{name}", "Customer"]:
        reply = reply.replace(placeholder, first_name)

    tone_lower = tone.lower()

    if tone_lower == "formal":
        if not any(reply.startswith(g) for g in ["Dear", "To Whom"]):
            reply = f"Dear {first_name},\n\n" + reply.lstrip()
        if not reply.rstrip().endswith((".", "!", "?")):
            reply = reply.rstrip() + "."
        if not any(s in reply for s in ["Yours sincerely", "Best regards", "Kind regards"]):
            reply = reply.rstrip() + "\n\nYours sincerely,\nCustomer Support Team"

    else:  # polite / professional / friendly
        if not any(reply.startswith(g) for g in ["Dear", "Hello", "Hi", "Thank"]):
            reply = f"Hello {first_name},\n\n" + reply.lstrip()
        if not any(s in reply for s in ["Best regards", "Kind regards", "Warm regards", "Cheers"]):
            reply = reply.rstrip() + "\n\nBest regards,\nCustomer Support Team"

    return reply


def _get_template_reply(templates: dict, category: str, tone: str, name: str) -> str:
    """Get a category + tone specific template reply."""
    first_name = str(name).split()[0] if name else "Customer"
    default_templates = {
        "Refund": {
            "Formal": f"Dear {first_name},\n\nThank you for contacting us regarding your refund request. We have reviewed your case and will process your refund within 5-7 business days.\n\nYours sincerely,\nCustomer Support Team",
            "Polite": f"Hello {first_name},\n\nThank you for reaching out! We have initiated your refund and you should see it within 3-5 business days.\n\nBest regards,\nCustomer Support Team",
        },
        "Billing": {
            "Formal": f"Dear {first_name},\n\nThank you for bringing this billing matter to our attention. We will resolve the discrepancy within 2 business days.\n\nYours sincerely,\nBilling Department",
            "Polite": f"Hello {first_name},\n\nThanks for getting in touch about your billing query! We will sort this out within 2 business days.\n\nBest regards,\nBilling Support Team",
        },
        "Delivery": {
            "Formal": f"Dear {first_name},\n\nThank you for contacting us regarding your delivery. We have escalated your case and will provide an update within 24 hours.\n\nYours sincerely,\nDelivery Support Team",
            "Polite": f"Hello {first_name},\n\nWe are sorry about the delay! We have flagged this with our logistics team and will update you within 24 hours.\n\nBest regards,\nDelivery Support Team",
        },
        "Technical": {
            "Formal": f"Dear {first_name},\n\nThank you for reporting this technical issue. Our team will investigate and resolve this within 24-48 hours.\n\nYours sincerely,\nTechnical Support Team",
            "Polite": f"Hello {first_name},\n\nThank you for letting us know! Our team is on it and will have this resolved within 24-48 hours.\n\nBest regards,\nTechnical Support Team",
        },
        "General": {
            "Formal": f"Dear {first_name},\n\nThank you for contacting us. We will respond with a comprehensive answer within 1-2 business days.\n\nYours sincerely,\nCustomer Support Team",
            "Polite": f"Hello {first_name},\n\nThank you for reaching out! We will get back to you within 1-2 business days.\n\nBest regards,\nCustomer Support Team",
        },
    }

    # Use provided templates if available, else use defaults
    source = templates if templates else default_templates
    cat_templates = source.get(category, source.get("General", default_templates["General"]))
    tone_key = "Formal" if tone.lower() == "formal" else "Polite"
    template = cat_templates.get(tone_key, list(cat_templates.values())[0])
    return template.replace("{name}", first_name)


# ─── Fallback Generator ───────────────────────────────────────────────────────

class FallbackEmailGenerator:
    """Template-based fallback used when no trained model is present."""

    TEMPLATES = {
        "professional": (
            "Thank you for your email. I have reviewed your message and will "
            "provide a comprehensive response shortly.\n\n"
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

    def generate(self, email_content: str, tone: str, subject: str = "",
                 customer_name: str = "Customer") -> dict:
        reply = self.TEMPLATES.get(tone.lower(), self.TEMPLATES["professional"])
        return {
            "reply":              reply,
            "confidence":         0.60,
            "predicted_category": "General",
            "predicted_priority": "Medium",
            "tone_applied":       tone,
            "model_version":      "fallback",
            "retrieval_score":    0.0,
        }
