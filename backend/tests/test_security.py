"""
Unit tests for JWT security utilities.
"""

import pytest
from datetime import timedelta

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_and_verify():
    plain = "mysecretpwd"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed)
    assert not verify_password("wrongpassword", hashed)


def test_create_and_decode_token():
    subject = "user-uuid-1234"
    token = create_access_token(subject=subject)
    decoded = decode_access_token(token)
    assert decoded == subject


def test_expired_token_returns_none():
    token = create_access_token(subject="user-1", expires_delta=timedelta(seconds=-1))
    result = decode_access_token(token)
    assert result is None


def test_invalid_token_returns_none():
    result = decode_access_token("this.is.not.a.valid.token")
    assert result is None
