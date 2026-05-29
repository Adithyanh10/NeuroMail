"""
Pytest configuration and shared fixtures.
"""

import os
import pytest

from app.db.session import Base, engine

# Set test environment variables before any app imports
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "test")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "test")
os.environ.setdefault("AWS_REGION", "us-east-1")
os.environ.setdefault("S3_BUCKET_NAME", "test-bucket")
os.environ.setdefault("ML_SERVER_URL", "http://localhost:8001")


@pytest.fixture(scope="session", autouse=True)
async def prepare_test_database():
    """Create and tear down the test database schema for backend tests."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
