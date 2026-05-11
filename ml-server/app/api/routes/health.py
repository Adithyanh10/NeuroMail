"""
Health check for the ML server.
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    model_loaded = request.app.state.model_state.get("model") is not None
    return HealthResponse(status="ok", model_loaded=model_loaded)
