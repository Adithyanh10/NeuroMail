"""
Email routes — all 20 advanced AI features exposed as REST endpoints.
"""
from typing import Optional
from fastapi import APIRouter, Depends, File, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.core.dependencies import get_current_user
from app.core.rate_limit import rate_limit
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.email import (
    AnalyticsResponse, EmailHistoryItem, FeedbackRequest, FeedbackResponse,
    GenerateReplyRequest, GenerateReplyResponse, GrammarCorrectionRequest,
    GrammarCorrectionResponse, HistoryResponse, UploadResponse, WritingStyleProfile,
)
from app.services.email_service import (
    create_reply, get_analytics, get_history, get_history_item,
    submit_feedback, get_writing_style,
)
from app.services.ml_service import correct_grammar_api, summarize_email_api
from app.services.s3_service import upload_file

router = APIRouter()

# ── Feature 1-16: Main generate endpoint ─────────────────────────────────────
@router.post("/generate-reply", response_model=GenerateReplyResponse,
             summary="Generate AI reply with 20 advanced features",
             dependencies=[Depends(rate_limit(max_requests=20, window_seconds=60))])
async def generate_reply_endpoint(payload: GenerateReplyRequest,
                                   current_user: User = Depends(get_current_user),
                                   db: AsyncSession = Depends(get_db)) -> GenerateReplyResponse:
    return await create_reply(payload, current_user, db)

# ── Feature 18: Streaming reply ───────────────────────────────────────────────
@router.post("/generate-reply/stream", summary="Stream reply token-by-token (SSE)")
async def generate_reply_stream(payload: GenerateReplyRequest,
                                 current_user: User = Depends(get_current_user)):
    import asyncio, json

    async def stream_from_ml():
        try:
            # Get the full reply from ML server (non-streaming call)
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{settings.ML_SERVER_URL}/predict",
                    json={
                        "email_content": payload.email_content,
                        "tone": payload.tone.value,
                        "subject": payload.subject or "",
                    }
                )
            if response.status_code != 200:
                yield f"data: {json.dumps({'type': 'error', 'message': 'ML server error'})}\n\n"
                return

            result = response.json()
            reply_text = result.pop("reply", "")

            # Send metadata first
            yield f"data: {json.dumps({'type': 'meta', 'data': result})}\n\n"

            # Stream reply word by word
            words = reply_text.split(" ")
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'type': 'token', 'token': chunk})}\n\n"
                await asyncio.sleep(0.04)

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except httpx.ConnectError:
            yield f"data: {json.dumps({'type': 'error', 'message': 'ML server unavailable'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        stream_from_ml(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

# ── Feature 8: Grammar correction ────────────────────────────────────────────
@router.post("/correct-grammar", response_model=GrammarCorrectionResponse,
             summary="Correct grammar and improve formality of draft reply")
async def grammar_correction(payload: GrammarCorrectionRequest,
                              current_user: User = Depends(get_current_user)) -> GrammarCorrectionResponse:
    result = await correct_grammar_api(payload.text)
    return GrammarCorrectionResponse(**result)

# ── Feature 7: Email summarization ───────────────────────────────────────────
@router.post("/summarize", summary="Summarize a long email into key points and action items")
async def summarize_endpoint(payload: dict, current_user: User = Depends(get_current_user)):
    return await summarize_email_api(payload.get("text",""))

# ── History with advanced filters ────────────────────────────────────────────
@router.get("/history", response_model=HistoryResponse, summary="Filterable email history")
async def history_endpoint(page: int = Query(default=1, ge=1),
                            page_size: int = Query(default=20, ge=1, le=100),
                            category: Optional[str] = Query(default=None),
                            priority: Optional[str] = Query(default=None),
                            tone: Optional[str] = Query(default=None),
                            intent: Optional[str] = Query(default=None),
                            emotion: Optional[str] = Query(default=None),
                            current_user: User = Depends(get_current_user),
                            db: AsyncSession = Depends(get_db)) -> HistoryResponse:
    return await get_history(current_user, db, page=page, page_size=page_size,
                             category=category, priority=priority, tone=tone,
                             intent=intent, emotion=emotion)

@router.get("/history/{item_id}", response_model=EmailHistoryItem)
async def history_item_endpoint(item_id: str, current_user: User = Depends(get_current_user),
                                 db: AsyncSession = Depends(get_db)) -> EmailHistoryItem:
    return await get_history_item(item_id, current_user, db)

# ── Feature 19: Feedback ──────────────────────────────────────────────────────
@router.post("/feedback", response_model=FeedbackResponse, summary="Rate a generated reply (1-5 stars)")
async def feedback_endpoint(payload: FeedbackRequest, current_user: User = Depends(get_current_user),
                             db: AsyncSession = Depends(get_db)) -> FeedbackResponse:
    return await submit_feedback(payload, current_user, db)

# ── Feature 9: Writing style profile ─────────────────────────────────────────
@router.get("/writing-style", response_model=WritingStyleProfile,
            summary="Get personalized writing style profile based on reply history")
async def writing_style_endpoint(current_user: User = Depends(get_current_user),
                                  db: AsyncSession = Depends(get_db)) -> WritingStyleProfile:
    return await get_writing_style(current_user, db)

# ── Feature 17: Analytics dashboard ──────────────────────────────────────────
@router.get("/analytics", response_model=AnalyticsResponse, summary="Full analytics dashboard data")
async def analytics_endpoint(current_user: User = Depends(get_current_user),
                              db: AsyncSession = Depends(get_db)) -> AnalyticsResponse:
    return await get_analytics(current_user, db)

# ── S3 Upload ─────────────────────────────────────────────────────────────────
@router.post("/upload", response_model=UploadResponse)
async def upload_endpoint(file: UploadFile = File(...),
                           current_user: User = Depends(get_current_user)) -> UploadResponse:
    result = upload_file(file, str(current_user.id))
    return UploadResponse(s3_key=result["s3_key"], url=result["url"])
