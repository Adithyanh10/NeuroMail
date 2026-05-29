"""
Unit tests for authentication endpoints.
"""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_register_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "securepassword123",
            },
        )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login_invalid_credentials():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/login",
            json={"identifier": "nonexistent@example.com", "password": "wrongpassword"},
        )
    assert response.status_code == 401
