"""
Unit tests for email generation and history endpoints.
"""

import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient

from app.main import app


MOCK_ML_RESPONSE = {"reply": "Thank you for your email.", "confidence": 0.92}


@pytest.mark.asyncio
async def test_generate_reply_unauthenticated():
    """Unauthenticated requests must be rejected with 403."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/generate-reply",
            json={"email_content": "Hello, can you help me?", "tone": "professional"},
        )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_history_unauthenticated():
    """History endpoint requires authentication."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/history")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_health_check():
    """Health endpoint is publicly accessible."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
