"""
Pydantic schemas — full 20-feature AI email system.
"""
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ToneEnum(str, Enum):
    professional = "professional"
    formal = "formal"
    friendly = "friendly"


class GenerateReplyRequest(BaseModel):
    email_content: str = Field(min_length=5, max_length=10000)
    tone: ToneEnum = ToneEnum.professional
    subject: Optional[str] = Field(default=None, max_length=255)


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


class ActionItem(BaseModel):
    task: str
    priority: str
    assignee: str


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


class GenerateReplyResponse(BaseModel):
    # Core
    reply: str
    tone: ToneEnum
    confidence: float
    predicted_category: str
    predicted_priority: str
    sentiment: str
    is_urgent: bool
    model_version: str
    history_id: str
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
    # Feature 12 — Spam
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
    tone_heatmap: List[HeatmapSegment] = []
    # Feature 22 — Reply Risk Checker
    reply_risk_issues: List[RiskIssue] = []
    reply_risk_score: float = 0.0
    reply_overall_risk: str = "low"
    reply_safe_to_send: bool = True
    reply_risk_counts: RiskCounts = RiskCounts(high=0, medium=0, low=0)


class EmailHistoryItem(BaseModel):
    id: str
    original_email: str
    generated_reply: str
    tone: str
    subject: Optional[str]
    predicted_category: Optional[str]
    predicted_priority: Optional[str]
    sentiment: Optional[str]
    emotion: Optional[str]
    intent: Optional[str]
    reply_grade: Optional[str]
    ai_confidence_pct: Optional[float]
    is_urgent: Optional[bool]
    is_suspicious: Optional[bool]
    risk_level: Optional[str]
    detected_language: Optional[str]
    is_meeting_request: Optional[bool]
    total_tasks: Optional[int]
    user_rating: Optional[int]
    s3_key: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class HistoryResponse(BaseModel):
    items: List[EmailHistoryItem]
    total: int
    page: int
    page_size: int


class UploadResponse(BaseModel):
    s3_key: str
    url: str
    message: str = "File uploaded successfully"


class CategoryStat(BaseModel):
    category: str
    count: int
    percentage: float


class AnalyticsResponse(BaseModel):
    total_replies: int
    category_breakdown: List[CategoryStat]
    priority_breakdown: List[CategoryStat]
    tone_breakdown: List[CategoryStat]
    intent_breakdown: List[CategoryStat]
    emotion_breakdown: List[CategoryStat]
    avg_confidence: float
    avg_reply_score: float
    urgent_count: int
    suspicious_count: int
    meeting_requests_count: int
    languages_detected: List[str]


# Feature 8 — Grammar Correction
class GrammarCorrectionRequest(BaseModel):
    text: str = Field(min_length=5, max_length=5000)


class GrammarCorrectionResponse(BaseModel):
    corrected_text: str
    corrections_count: int
    corrections: List[Dict]
    formality_score: float
    improvement_pct: float


# Feature 19 — Feedback
class FeedbackRequest(BaseModel):
    history_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=500)


class FeedbackResponse(BaseModel):
    message: str
    history_id: str
    rating: int


# Feature 9 — Writing Style Profile
class WritingStyleProfile(BaseModel):
    user_id: str
    preferred_tone: str
    avg_reply_length: int
    common_phrases: List[str]
    formality_level: float
    total_replies_analyzed: int
