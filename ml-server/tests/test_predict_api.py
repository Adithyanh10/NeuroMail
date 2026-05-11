"""
Integration tests for the /predict endpoint.
"""

import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_predict_professional():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/predict",
            json={
                "email_content": "Hi, I wanted to follow up on our last meeting.",
                "tone": "professional",
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "confidence" in data
    assert len(data["reply"]) > 0


@pytest.mark.asyncio
async def test_predict_invalid_tone():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/predict",
            json={"email_content": "Hello there.", "tone": "aggressive"},
        )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_predict_too_short_content():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/predict",
            json={"email_content": "Hi", "tone": "formal"},
        )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
