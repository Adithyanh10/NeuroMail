"""
AI Email Reply Generator - FastAPI Backend Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy import select

from app.api.routes import auth, email, health
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.user import User

app = FastAPI(
    title="AI Email Reply Generator API",
    description="Generate professional AI-powered email replies",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
# NOTE: Starlette applies middleware in reverse-add order.
# TrustedHostMiddleware must be added FIRST so it runs LAST (after CORS).
# This prevents it from rejecting CORS preflight OPTIONS requests with 400.

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(email.router, prefix="/api/v1", tags=["Email"])

register_exception_handlers(app)


async def seed_demo_user() -> None:
    """Create the demo user if it doesn't already exist."""
    demo_email = "demo@aimail.com"
    demo_password = "Demo@1234"
    demo_username = "Demo User"

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == demo_email))
        existing = result.scalar_one_or_none()
        if not existing:
            demo_user = User(
                email=demo_email,
                username=demo_username,
                password=hash_password(demo_password),
            )
            session.add(demo_user)
            await session.commit()
            print(f"Demo user created: {demo_email}")
        else:
            print(f"Demo user already exists: {demo_email}")


@app.on_event("startup")
async def startup_event() -> None:
    """Run tasks on application startup."""
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await seed_demo_user()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Run tasks on application shutdown."""
    print("Shutting down application")
