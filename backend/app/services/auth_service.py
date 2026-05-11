"""
Business logic for user registration and login.
"""

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse


async def register_user(payload: RegisterRequest, db: AsyncSession) -> RegisterResponse:
    """
    Create a new user account.
    Raises HTTP 409 if the email is already registered.
    """
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        username=payload.username,
        password=hash_password(payload.password),
    )
    db.add(user)
    await db.flush()  # get the generated id before commit

    return RegisterResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
    )


async def login_user(payload: LoginRequest, db: AsyncSession) -> LoginResponse:
    """
    Authenticate a user using email OR username + password.
    Raises HTTP 401 on invalid credentials.
    """
    identifier = payload.identifier.strip()

    # Try email first, then fall back to username
    if "@" in identifier:
        result = await db.execute(select(User).where(User.email == identifier))
    else:
        result = await db.execute(select(User).where(User.username == identifier))

    user = result.scalar_one_or_none()

    # If username lookup failed, also try email as fallback
    if user is None and "@" not in identifier:
        result2 = await db.execute(select(User).where(User.email == identifier))
        user = result2.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Check your email/username and password.",
        )

    token = create_access_token(subject=str(user.id))
    return LoginResponse(
        access_token=token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        username=user.username,
        email=user.email,
        user_id=str(user.id),
    )
