"""
Full inference pipeline — integrates all 20 advanced AI features.
"""
import re
from typing import Any
from app.model.advanced_engine import (
    detect_intent, analyze_emotion, recommend_tone,
    score_reply, generate_multi_replies, summarize_email,
    correct_grammar_and_formality, detect_spam_and_risk,
    detect_language, extract_meeting_info, extract_action_items,
    generate_signature, humanize_reply, generate_tone_heatmap,
    check_reply_risks,
)

def preprocess(email_content: str) -> str:
    header_pattern = re.compile(
        r"^(From|To|Cc|Bcc|Subject|Date|Reply-To):.*$",
        re.MULTILINE | re.IGNORECASE,
    )
    cleaned = header_pattern.sub("", email_content)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    if len(cleaned) > 4096:
        cleaned = cleaned[:4096]
    return cleaned

def analyze_sentiment(text: str) -> str:
    text_lower = text.lower()
    negative_keywords = [
        "angry","frustrated","terrible","awful","horrible","worst",
        "unacceptable","disgusting","furious","disappointed","useless",
        "scam","fraud","never again","waste","pathetic","ridiculous",
    ]
    positive_keywords = [
        "thank","great","excellent","wonderful","happy","pleased",
        "satisfied","appreciate","love","perfect","amazing","fantastic",
    ]
    neg = sum(1 for kw in negative_keywords if kw in text_lower)
    pos = sum(1 for kw in positive_keywords if kw in text_lower)
    if neg > pos:
        return "negative"
    elif pos > neg:
        return "positive"
    return "neutral"

def extract_urgency_signals(text: str) -> bool:
    urgency_keywords = [
        "urgent","asap","immediately","right now","emergency",
        "critical","deadline","today","as soon as possible",
    ]
    return any(kw in text.lower() for kw in urgency_keywords)

def run_inference(model: Any, email_content: str, tone: str, subject: str = "") -> dict:
    processed = preprocess(email_content)

    # ── Core ML prediction ────────────────────────────────────────────────────
    if hasattr(model, "generate"):
        base_result = model.generate(processed, tone, subject=subject)
    elif callable(model):
        base_result = model(processed, tone)
    else:
        raise ValueError("Unsupported model interface")

    base_reply = base_result.get("reply", "")

    # ── Feature 1: Intent Detection ───────────────────────────────────────────
    intent_data = detect_intent(processed)

    # ── Feature 2: Emotion Analysis ───────────────────────────────────────────
    emotion_data = analyze_emotion(processed)

    # ── Feature 3: Tone Optimization ─────────────────────────────────────────
    tone_rec = recommend_tone(intent_data["intent"], emotion_data["emotion"])

    # ── Feature 4: Sentiment (existing, enhanced) ────────────────────────────
    sentiment = analyze_sentiment(processed)

    # ── Feature 5: Reply Scoring ──────────────────────────────────────────────
    reply_scores = score_reply(base_reply)

    # ── Feature 6: Multi-Reply Suggestions ───────────────────────────────────
    multi_replies = generate_multi_replies(base_reply, intent_data["intent"], emotion_data["emotion"])

    # ── Feature 7: Email Summarization ───────────────────────────────────────
    summary = summarize_email(processed)

    # ── Feature 10: Priority Detection (existing + enhanced) ─────────────────
    is_urgent = extract_urgency_signals(processed)
    predicted_priority = base_result.get("predicted_priority", "Medium")
    if is_urgent and predicted_priority != "High":
        predicted_priority = "High"

    # ── Feature 11: Signature Generator ──────────────────────────────────────
    signature = generate_signature(intent_data["intent"], base_result.get("predicted_category","General"))

    # ── Feature 12: Spam & Risk Detection ────────────────────────────────────
    spam_data = detect_spam_and_risk(processed)

    # ── Feature 13: Language Detection ───────────────────────────────────────
    lang_data = detect_language(processed)

    # ── Feature 14: Meeting Extraction ───────────────────────────────────────
    meeting_data = extract_meeting_info(processed)

    # ── Feature 15: Action Items ──────────────────────────────────────────────
    action_data = extract_action_items(processed)

    # ── Feature 16: Humanize Reply ────────────────────────────────────────────
    humanized_reply = humanize_reply(base_reply)

    # ── Feature 21: Tone Heatmap ──────────────────────────────────────────────
    tone_heatmap = generate_tone_heatmap(processed)

    # ── Assemble final reply with signature ───────────────────────────────────
    final_reply = humanized_reply
    if not final_reply.strip().endswith(signature.split("\n")[0]):
        final_reply = final_reply.rstrip() + "\n\n" + signature

    confidence = base_result.get("confidence", 0.75)
    if is_urgent and predicted_priority == "High":
        confidence = min(1.0, confidence + 0.05)

    # ── Feature 22: Reply Risk Checker ───────────────────────────────────────
    reply_risks = check_reply_risks(final_reply, incoming_emotion=emotion_data["emotion"])

    return {
        # Core
        "reply":               final_reply,
        "confidence":          round(confidence, 4),
        "predicted_category":  base_result.get("predicted_category", "General"),
        "predicted_priority":  predicted_priority,
        "tone_applied":        tone,
        "sentiment":           sentiment,
        "is_urgent":           is_urgent,
        "model_version":       base_result.get("model_version", "2.0"),
        # Feature 1
        "intent":              intent_data["intent"],
        "intent_confidence":   intent_data["confidence"],
        # Feature 2
        "emotion":             emotion_data["emotion"],
        "emotion_intensity":   emotion_data["intensity"],
        # Feature 3
        "recommended_tone":    tone_rec["recommended_tone"],
        "tone_style":          tone_rec["style_description"],
        # Feature 5
        "reply_scores":        reply_scores["scores"],
        "reply_grade":         reply_scores["grade"],
        "ai_confidence_pct":   reply_scores["ai_confidence_pct"],
        # Feature 6
        "multi_replies":       multi_replies,
        # Feature 7
        "email_summary":       summary["summary"],
        "key_points":          summary["key_points"],
        "action_items_summary":summary["action_items"],
        "deadlines":           summary["deadlines"],
        "entities":            summary["entities"],
        # Feature 11
        "signature":           signature,
        # Feature 12
        "is_suspicious":       spam_data["is_suspicious"],
        "risk_level":          spam_data["risk_level"],
        "risk_score":          spam_data["risk_score"],
        "spam_warnings":       spam_data["warnings"],
        # Feature 13
        "detected_language":   lang_data["language"],
        "language_confidence": lang_data["confidence"],
        # Feature 14
        "is_meeting_request":  meeting_data["is_meeting_request"],
        "meeting_dates":       meeting_data["dates"],
        "meeting_times":       meeting_data["times"],
        "meeting_participants":meeting_data["participants"],
        # Feature 15
        "extracted_tasks":     action_data["action_items"],
        "total_tasks":         action_data["total_tasks"],
        # Feature 21 — Tone Heatmap
        "tone_heatmap":        tone_heatmap,
        # Feature 22 — Reply Risk Checker
        "reply_risk_issues":   reply_risks["issues"],
        "reply_risk_score":    reply_risks["risk_score"],
        "reply_overall_risk":  reply_risks["overall_risk"],
        "reply_safe_to_send":  reply_risks["safe_to_send"],
        "reply_risk_counts":   {
            "high":   reply_risks["high_count"],
            "medium": reply_risks["medium_count"],
            "low":    reply_risks["low_count"],
        },
    }
