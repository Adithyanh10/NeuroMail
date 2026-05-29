"""
Unit tests for authentication endpoints.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.db.session import Base, get_db
from app.main import app


# ── In-memory SQLite DB for tests ─────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_auth.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@pytest.fixture(autouse=True)
async def setup_db():
    """Create all tables before each test, drop after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.asyncio
async def test_register_success():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
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
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/login",
            # LoginRequest uses "identifier" not "email"
            json={"identifier": "nonexistent@example.com", "password": "wrongpassword"},
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_register_then_login():
    """Register a user then log in with their credentials."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        reg = await client.post(
            "/api/v1/register",
            json={"email": "alice@example.com", "username": "alice", "password": "Password123"},
        )
        assert reg.status_code == 201

        login = await client.post(
            "/api/v1/login",
            json={"identifier": "alice@example.com", "password": "Password123"},
        )
        assert login.status_code == 200
        data = login.json()
        assert "access_token" in data
        assert data["email"] == "alice@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email():
    """Registering the same email twice returns 409."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        payload = {"email": "dup@example.com", "username": "dup", "password": "Password123"}
        await client.post("/api/v1/register", json=payload)
        response = await client.post("/api/v1/register", json=payload)
    assert response.status_code == 409
