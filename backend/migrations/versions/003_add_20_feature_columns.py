"""Add 20-feature AI columns to email_history

Revision ID: 003
Revises: 002
Create Date: 2024-01-03 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Feature 1 — Intent
    op.add_column("email_history", sa.Column("intent", sa.String(100), nullable=True))
    op.add_column("email_history", sa.Column("intent_confidence", sa.Float(), nullable=True))
    
    # Feature 2 — Emotion
    op.add_column("email_history", sa.Column("emotion", sa.String(50), nullable=True))
    op.add_column("email_history", sa.Column("emotion_intensity", sa.Float(), nullable=True))
    
    # Feature 3 — Recommended Tone
    op.add_column("email_history", sa.Column("recommended_tone", sa.String(50), nullable=True))
    
    # Feature 5 — Reply Scoring
    op.add_column("email_history", sa.Column("reply_grade", sa.String(5), nullable=True))
    op.add_column("email_history", sa.Column("ai_confidence_pct", sa.Float(), nullable=True))
    
    # Feature 12 — Spam Detection
    op.add_column("email_history", sa.Column("is_suspicious", sa.Boolean(), nullable=True, server_default="false"))
    op.add_column("email_history", sa.Column("risk_level", sa.String(20), nullable=True))
    op.add_column("email_history", sa.Column("risk_score", sa.Float(), nullable=True))
    
    # Feature 13 — Language
    op.add_column("email_history", sa.Column("detected_language", sa.String(50), nullable=True))
    
    # Feature 14 — Meeting
    op.add_column("email_history", sa.Column("is_meeting_request", sa.Boolean(), nullable=True, server_default="false"))
    
    # Feature 15 — Tasks
    op.add_column("email_history", sa.Column("total_tasks", sa.Integer(), nullable=True, server_default="0"))
    
    # Feature 19 — Feedback
    op.add_column("email_history", sa.Column("user_rating", sa.Integer(), nullable=True))
    op.add_column("email_history", sa.Column("user_feedback", sa.Text(), nullable=True))


def downgrade() -> None:
    columns = [
        "intent", "intent_confidence", "emotion", "emotion_intensity", "recommended_tone",
        "reply_grade", "ai_confidence_pct", "is_suspicious", "risk_level", "risk_score",
        "detected_language", "is_meeting_request", "total_tasks", "user_rating", "user_feedback"
    ]
    for col in columns:
        op.drop_column("email_history", col)
