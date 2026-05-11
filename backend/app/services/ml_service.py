"""
HTTP client for ML inference server — all endpoints.
"""
import httpx
from fastapi import HTTPException, status
from app.core.config import settings
from app.schemas.email import ToneEnum

ML_BASE = settings.ML_SERVER_URL
TIMEOUT = 30.0

async def generate_reply(email_content: str, tone: ToneEnum, subject: str = "") -> dict:
    payload = {"email_content": email_content, "tone": tone.value, "subject": subject}
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(f"{ML_BASE}/predict", json=payload)
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="ML inference server is unavailable")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="ML inference server timed out")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"ML server error: {response.text}")
    return response.json()

async def correct_grammar_api(text: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(f"{ML_BASE}/correct-grammar", json={"text": text})
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Grammar correction failed")
        return response.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="ML server unavailable")

async def summarize_email_api(text: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(f"{ML_BASE}/summarize", json={"text": text})
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Summarization failed")
        return response.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="ML server unavailable")
