"""
/predict endpoint — full 20-feature AI inference response.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import asyncio, json
from app.model.inference import run_inference

router = APIRouter()

class PredictRequest(BaseModel):
    email_content: str = Field(min_length=5, max_length=40000)
    tone: str = Field(default="professional", pattern="^(professional|formal|friendly)$")
    subject: Optional[str] = Field(default="", max_length=255)

class ReplyScores(BaseModel):
    professionalism: float
    clarity: float
    confidence: float
    politeness: float
    grammar_quality: float

class MultiReplies(BaseModel):
    short_reply: str
    detailed_reply: str
    persuasive_reply: str

class HeatmapSegment(BaseModel):
    text: str
    tone: str
    color: str
    emoji: str
    intensity: float

class RiskIssue(BaseModel):
    category: str
    severity: str
    icon: str
    matched: str
    tip: str

class RiskCounts(BaseModel):
    high: int
    medium: int
    low: int

class ActionItem(BaseModel):
    task: str
    priority: str
    assignee: str

class PredictResponse(BaseModel):
    # Core
    reply: str
    confidence: float
    predicted_category: str
    predicted_priority: str
    tone_applied: str
    sentiment: str
    is_urgent: bool
    model_version: str
    # Feature 1 — Intent
    intent: str
    intent_confidence: float
    # Feature 2 — Emotion
    emotion: str
    emotion_intensity: float
    # Feature 3 — Tone Optimization
    recommended_tone: str
    tone_style: str
    # Feature 5 — Reply Scoring
    reply_scores: ReplyScores
    reply_grade: str
    ai_confidence_pct: float
    # Feature 6 — Multi-Reply
    multi_replies: MultiReplies
    # Feature 7 — Summarization
    email_summary: str
    key_points: List[str]
    action_items_summary: List[str]
    deadlines: List[str]
    entities: List[str]
    # Feature 11 — Signature
    signature: str
    # Feature 12 — Spam Detection
    is_suspicious: bool
    risk_level: str
    risk_score: float
    spam_warnings: List[str]
    # Feature 13 — Language
    detected_language: str
    language_confidence: float
    # Feature 14 — Meeting
    is_meeting_request: bool
    meeting_dates: List[str]
    meeting_times: List[str]
    meeting_participants: List[str]
    # Feature 15 — Action Items
    extracted_tasks: List[ActionItem]
    total_tasks: int
    # Feature 21 — Tone Heatmap
    tone_heatmap: List[HeatmapSegment]
    # Feature 22 — Reply Risk Checker
    reply_risk_issues: List[RiskIssue]
    reply_risk_score: float
    reply_overall_risk: str
    reply_safe_to_send: bool
    reply_risk_counts: RiskCounts

@router.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest, request: Request) -> PredictResponse:
    """Full 20-feature AI email analysis and reply generation."""
    model = request.app.state.model_state.get("model")
    if model is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model not loaded")
    result = run_inference(model, payload.email_content, payload.tone, subject=payload.subject or "")
    return PredictResponse(**result)

# ── Feature 18: Real-Time Streaming Replies ───────────────────────────────────
@router.post("/predict/stream")
async def predict_stream(payload: PredictRequest, request: Request):
    """Stream the generated reply token-by-token (SSE)."""
    model = request.app.state.model_state.get("model")
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    result = run_inference(model, payload.email_content, payload.tone, subject=payload.subject or "")
    reply_text = result["reply"]

    async def token_generator():
        # Send metadata first
        meta = {k: v for k, v in result.items() if k != "reply"}
        yield f"data: {json.dumps({'type': 'meta', 'data': meta})}\n\n"
        # Stream reply word by word
        words = reply_text.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'type': 'token', 'token': chunk})}\n\n"
            await asyncio.sleep(0.04)
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        token_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

# ── Feature 8: Grammar Correction endpoint ────────────────────────────────────
@router.post("/correct-grammar")
async def correct_grammar(payload: dict):
    from app.model.advanced_engine import correct_grammar_and_formality
    text = payload.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="text field required")
    return correct_grammar_and_formality(text)

# ── Feature 7: Summarize endpoint ─────────────────────────────────────────────
@router.post("/summarize")
async def summarize(payload: dict):
    from app.model.advanced_engine import summarize_email
    text = payload.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="text field required")
    return summarize_email(text)
