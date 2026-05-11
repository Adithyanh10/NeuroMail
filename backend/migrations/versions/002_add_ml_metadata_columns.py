"""Add ML metadata columns to email_history

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("email_history", sa.Column("subject",            sa.String(255), nullable=True))
    op.add_column("email_history", sa.Column("predicted_category", sa.String(100), nullable=True))
    op.add_column("email_history", sa.Column("predicted_priority", sa.String(50),  nullable=True))
    op.add_column("email_history", sa.Column("sentiment",          sa.String(50),  nullable=True))
    op.add_column("email_history", sa.Column("is_urgent",          sa.Boolean(),   nullable=True, server_default="false"))
    op.add_column("email_history", sa.Column("confidence",         sa.Float(),     nullable=True))


def downgrade() -> None:
    for col in ["subject", "predicted_category", "predicted_priority", "sentiment", "is_urgent", "confidence"]:
        op.drop_column("email_history", col)
