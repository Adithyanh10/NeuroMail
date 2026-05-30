"""
HTTP client for ML inference server — with graceful fallback mock responses
when the ML server is unavailable (local dev without Docker).
"""
import httpx
from app.core.config import settings
from app.schemas.email import ToneEnum

ML_BASE = settings.ML_SERVER_URL
TIMEOUT = 10.0  # shorter timeout so fallback kicks in quickly


def _mock_reply(email_content: str, tone: str) -> dict:
    """Return a realistic mock response when the ML server is unavailable."""
    tone_phrases = {
        "professional": "Thank you for reaching out. I have reviewed your message and will address your concerns promptly. Please let me know if you need any further clarification.",
        "formal": "Dear Sir/Madam, I acknowledge receipt of your correspondence and wish to inform you that the matter shall be attended to with due diligence.",
        "friendly": "Hey! Thanks so much for getting in touch. I'll look into this right away and get back to you soon. Let me know if there's anything else I can help with!",
    }
    reply = tone_phrases.get(tone, tone_phrases["professional"])
    word_count = len(email_content.split())
    is_urgent = any(w in email_content.lower() for w in ["urgent", "asap", "immediately", "critical", "emergency"])
    is_suspicious = any(w in email_content.lower() for w in ["click here", "verify account", "prize", "winner", "free money"])
    is_meeting = any(w in email_content.lower() for w in ["meeting", "schedule", "call", "zoom", "teams", "calendar"])

    return {
        "reply": reply,
        "tone": tone,
        "confidence": 0.87,
        "predicted_category": "General" if word_count < 20 else "Business",
        "predicted_priority": "High" if is_urgent else "Medium",
        "sentiment": "neutral",
        "is_urgent": is_urgent,
        "model_version": "mock-1.0",
        "intent": "inquiry",
        "intent_confidence": 0.82,
        "emotion": "neutral",
        "emotion_intensity": 0.3,
        "recommended_tone": tone,
        "tone_style": "balanced",
        "reply_scores": {
            "professionalism": 0.85,
            "clarity": 0.88,
            "confidence": 0.80,
            "politeness": 0.90,
            "grammar_quality": 0.92,
        },
        "reply_grade": "A",
        "ai_confidence_pct": 87.0,
        "multi_replies": {
            "short_reply": "Thank you for your message. I'll get back to you shortly.",
            "detailed_reply": reply,
            "persuasive_reply": f"{reply} I'm confident we can find the best solution together.",
        },
        "email_summary": f"The sender is requesting assistance regarding: {email_content[:80]}...",
        "key_points": ["Request received", "Action required", "Follow-up needed"],
        "action_items_summary": ["Review the request", "Prepare a response", "Schedule follow-up"],
        "deadlines": [],
        "entities": [],
        "signature": "Best regards,\nAI Email Assistant",
        "is_suspicious": is_suspicious,
        "risk_level": "high" if is_suspicious else "low",
        "risk_score": 0.85 if is_suspicious else 0.05,
        "spam_warnings": ["Suspicious link detected"] if is_suspicious else [],
        "detected_language": "english",
        "language_confidence": 0.99,
        "is_meeting_request": is_meeting,
        "meeting_dates": [],
        "meeting_times": [],
        "meeting_participants": [],
        "extracted_tasks": [],
        "total_tasks": 0,
    }


def _mock_grammar(text: str) -> dict:
    """Return a mock grammar correction response."""
    corrections = []
    corrected = text

    replacements = [
        ("gonna", "going to"), ("wanna", "want to"), ("gotta", "have to"),
        ("kinda", "somewhat"), ("u ", "you "), ("r ", "are "), ("ur ", "your "),
        ("asap", "as soon as possible"), ("btw", "by the way"),
        ("hey", "Hello"), ("hi there", "Dear Sir/Madam"),
    ]
    for informal, formal in replacements:
        if informal in corrected.lower():
            corrected = corrected.replace(informal, formal)
            corrections.append({"from": informal, "to": formal})

    improvement = min(len(corrections) * 12, 60)
    return {
        "corrected_text": corrected,
        "corrections_count": len(corrections),
        "corrections": corrections,
        "formality_score": min(0.5 + len(corrections) * 0.08, 0.95),
        "improvement_pct": improvement,
    }


def _mock_summarize(text: str) -> dict:
    words = text.split()
    return {
        "summary": f"This email discusses: {' '.join(words[:15])}...",
        "key_points": [
            f"Main topic: {' '.join(words[:5])}",
            "Action required from recipient",
            "Follow-up may be needed",
        ],
        "action_items": ["Review the request", "Respond within 24 hours"],
        "sentiment": "neutral",
        "word_count": len(words),
    }


async def generate_reply(email_content: str, tone: ToneEnum, subject: str = "") -> dict:
    payload = {"email_content": email_content, "tone": tone.value, "subject": subject}
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(f"{ML_BASE}/predict", json=payload)
        if response.status_code == 200:
            return response.json()
        # ML server returned an error — use mock
        return _mock_reply(email_content, tone.value)
    except (httpx.ConnectError, httpx.TimeoutException, Exception):
        # ML server unavailable — use mock so the app still works
        return _mock_reply(email_content, tone.value)


async def correct_grammar_api(text: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(f"{ML_BASE}/correct-grammar", json={"text": text})
        if response.status_code == 200:
            return response.json()
        return _mock_grammar(text)
    except (httpx.ConnectError, httpx.TimeoutException, Exception):
        return _mock_grammar(text)


async def summarize_email_api(text: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(f"{ML_BASE}/summarize", json={"text": text})
        if response.status_code == 200:
            return response.json()
        return _mock_summarize(text)
    except (httpx.ConnectError, httpx.TimeoutException, Exception):
        return _mock_summarize(text)
