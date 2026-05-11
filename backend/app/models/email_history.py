"""
EmailHistory ORM model — stores all 20-feature AI analysis results.
"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class EmailHistory(Base):
    __tablename__ = "email_history"

    id: Mapped[str]              = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str]         = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_email: Mapped[str]  = mapped_column(Text, nullable=False)
    generated_reply: Mapped[str] = mapped_column(Text, nullable=False)
    tone: Mapped[str]            = mapped_column(String(50), nullable=False)
    subject: Mapped[str | None]  = mapped_column(String(255), nullable=True)
    # Core ML
    predicted_category: Mapped[str | None]  = mapped_column(String(100), nullable=True)
    predicted_priority: Mapped[str | None]  = mapped_column(String(50),  nullable=True)
    sentiment: Mapped[str | None]           = mapped_column(String(50),  nullable=True)
    is_urgent: Mapped[bool | None]          = mapped_column(Boolean, nullable=True, default=False)
    confidence: Mapped[float | None]        = mapped_column(Float, nullable=True)
    # Feature 1 — Intent
    intent: Mapped[str | None]              = mapped_column(String(100), nullable=True)
    intent_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Feature 2 — Emotion
    emotion: Mapped[str | None]             = mapped_column(String(50), nullable=True)
    emotion_intensity: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Feature 3 — Recommended Tone
    recommended_tone: Mapped[str | None]    = mapped_column(String(50), nullable=True)
    # Feature 5 — Reply Scoring
    reply_grade: Mapped[str | None]         = mapped_column(String(5), nullable=True)
    ai_confidence_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Feature 12 — Spam
    is_suspicious: Mapped[bool | None]      = mapped_column(Boolean, nullable=True, default=False)
    risk_level: Mapped[str | None]          = mapped_column(String(20), nullable=True)
    risk_score: Mapped[float | None]        = mapped_column(Float, nullable=True)
    # Feature 13 — Language
    detected_language: Mapped[str | None]   = mapped_column(String(50), nullable=True)
    # Feature 14 — Meeting
    is_meeting_request: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)
    # Feature 15 — Tasks
    total_tasks: Mapped[int | None]         = mapped_column(Integer, nullable=True, default=0)
    # Feature 19 — Feedback
    user_rating: Mapped[int | None]         = mapped_column(Integer, nullable=True)
    user_feedback: Mapped[str | None]       = mapped_column(Text, nullable=True)
    # Storage
    s3_key: Mapped[str | None]              = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime]            = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="email_history", lazy="noload")
