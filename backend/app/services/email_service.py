"""
Email service — full 20-feature persistence and analytics.
"""
import json
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.email_history import EmailHistory
from app.models.user import User
from app.schemas.email import (
    AnalyticsResponse, CategoryStat, EmailHistoryItem,
    FeedbackRequest, FeedbackResponse,
    GenerateReplyRequest, GenerateReplyResponse,
    GrammarCorrectionRequest, GrammarCorrectionResponse,
    HistoryResponse, WritingStyleProfile,
)
from app.services.ml_service import generate_reply, correct_grammar_api


async def create_reply(payload: GenerateReplyRequest, current_user: User, db: AsyncSession) -> GenerateReplyResponse:
    ml = await generate_reply(payload.email_content, payload.tone, subject=payload.subject or "")

    history = EmailHistory(
        user_id=current_user.id,
        original_email=payload.email_content,
        generated_reply=ml["reply"],
        tone=payload.tone.value,
        subject=payload.subject,
        predicted_category=ml.get("predicted_category","General"),
        predicted_priority=ml.get("predicted_priority","Medium"),
        sentiment=ml.get("sentiment","neutral"),
        is_urgent=ml.get("is_urgent",False),
        confidence=ml.get("confidence",1.0),
        intent=ml.get("intent","general"),
        intent_confidence=ml.get("intent_confidence",0.5),
        emotion=ml.get("emotion","neutral"),
        emotion_intensity=ml.get("emotion_intensity",0.3),
        recommended_tone=ml.get("recommended_tone","professional"),
        reply_grade=ml.get("reply_grade","B"),
        ai_confidence_pct=ml.get("ai_confidence_pct",75.0),
        is_suspicious=ml.get("is_suspicious",False),
        risk_level=ml.get("risk_level","low"),
        risk_score=ml.get("risk_score",0.0),
        detected_language=ml.get("detected_language","english"),
        is_meeting_request=ml.get("is_meeting_request",False),
        total_tasks=ml.get("total_tasks",0),
    )
    db.add(history)
    await db.flush()
    await db.commit()

    return GenerateReplyResponse(
        reply=ml["reply"], tone=payload.tone,
        confidence=ml.get("confidence",1.0),
        predicted_category=ml.get("predicted_category","General"),
        predicted_priority=ml.get("predicted_priority","Medium"),
        sentiment=ml.get("sentiment","neutral"),
        is_urgent=ml.get("is_urgent",False),
        model_version=ml.get("model_version","2.0"),
        history_id=history.id,
        intent=ml.get("intent","general"),
        intent_confidence=ml.get("intent_confidence",0.5),
        emotion=ml.get("emotion","neutral"),
        emotion_intensity=ml.get("emotion_intensity",0.3),
        recommended_tone=ml.get("recommended_tone","professional"),
        tone_style=ml.get("tone_style","balanced"),
        reply_scores=ml.get("reply_scores",{"professionalism":0.8,"clarity":0.8,"confidence":0.8,"politeness":0.8,"grammar_quality":0.8}),
        reply_grade=ml.get("reply_grade","B"),
        ai_confidence_pct=ml.get("ai_confidence_pct",75.0),
        multi_replies=ml.get("multi_replies",{"short_reply":"","detailed_reply":"","persuasive_reply":""}),
        email_summary=ml.get("email_summary",""),
        key_points=ml.get("key_points",[]),
        action_items_summary=ml.get("action_items_summary",[]),
        deadlines=ml.get("deadlines",[]),
        entities=ml.get("entities",[]),
        signature=ml.get("signature",""),
        is_suspicious=ml.get("is_suspicious",False),
        risk_level=ml.get("risk_level","low"),
        risk_score=ml.get("risk_score",0.0),
        spam_warnings=ml.get("spam_warnings",[]),
        detected_language=ml.get("detected_language","english"),
        language_confidence=ml.get("language_confidence",0.9),
        is_meeting_request=ml.get("is_meeting_request",False),
        meeting_dates=ml.get("meeting_dates",[]),
        meeting_times=ml.get("meeting_times",[]),
        meeting_participants=ml.get("meeting_participants",[]),
        extracted_tasks=ml.get("extracted_tasks",[]),
        total_tasks=ml.get("total_tasks",0),
    )


async def get_history(current_user: User, db: AsyncSession, page: int = 1, page_size: int = 20,
                      category: str | None = None, priority: str | None = None,
                      tone: str | None = None, intent: str | None = None,
                      emotion: str | None = None) -> HistoryResponse:
    page = max(1, page); page_size = max(1, min(100, page_size))
    offset = (page - 1) * page_size
    base_filter = [EmailHistory.user_id == current_user.id]
    if category: base_filter.append(EmailHistory.predicted_category == category)
    if priority:  base_filter.append(EmailHistory.predicted_priority == priority)
    if tone:      base_filter.append(EmailHistory.tone == tone)
    if intent:    base_filter.append(EmailHistory.intent == intent)
    if emotion:   base_filter.append(EmailHistory.emotion == emotion)

    count_result = await db.execute(select(func.count(EmailHistory.id)).where(*base_filter))
    total = count_result.scalar_one()
    rows_result = await db.execute(
        select(EmailHistory).where(*base_filter)
        .order_by(EmailHistory.created_at.desc()).offset(offset).limit(page_size)
    )
    rows = rows_result.scalars().all()
    return HistoryResponse(items=[EmailHistoryItem.model_validate(r) for r in rows], total=total, page=page, page_size=page_size)


async def get_history_item(item_id: str, current_user: User, db: AsyncSession) -> EmailHistoryItem:
    result = await db.execute(select(EmailHistory).where(EmailHistory.id == item_id, EmailHistory.user_id == current_user.id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return EmailHistoryItem.model_validate(item)


async def submit_feedback(payload: FeedbackRequest, current_user: User, db: AsyncSession) -> FeedbackResponse:
    result = await db.execute(select(EmailHistory).where(EmailHistory.id == payload.history_id, EmailHistory.user_id == current_user.id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=404, detail="History item not found")
    item.user_rating = payload.rating
    item.user_feedback = payload.comment
    await db.flush()
    return FeedbackResponse(message="Feedback recorded. Thank you!", history_id=payload.history_id, rating=payload.rating)


async def get_writing_style(current_user: User, db: AsyncSession) -> WritingStyleProfile:
    result = await db.execute(
        select(EmailHistory).where(EmailHistory.user_id == current_user.id)
        .order_by(EmailHistory.created_at.desc()).limit(50)
    )
    items = result.scalars().all()
    if not items:
        return WritingStyleProfile(user_id=current_user.id, preferred_tone="professional",
                                   avg_reply_length=0, common_phrases=[], formality_level=0.7, total_replies_analyzed=0)
    tones = [i.tone for i in items if i.tone]
    preferred_tone = max(set(tones), key=tones.count) if tones else "professional"
    avg_len = int(sum(len(i.generated_reply.split()) for i in items) / len(items))
    formality = 0.9 if preferred_tone == "formal" else 0.7 if preferred_tone == "professional" else 0.5
    return WritingStyleProfile(user_id=current_user.id, preferred_tone=preferred_tone,
                               avg_reply_length=avg_len, common_phrases=["Thank you","Best regards","Please"],
                               formality_level=formality, total_replies_analyzed=len(items))


async def get_analytics(current_user: User, db: AsyncSession) -> AnalyticsResponse:
    def _breakdown(rows) -> list:
        total = sum(r.count for r in rows)
        return [CategoryStat(category=str(r.label or "Unknown"), count=r.count,
                             percentage=round(r.count/total*100,1) if total else 0.0) for r in rows]

    total_r = await db.execute(select(func.count(EmailHistory.id)).where(EmailHistory.user_id == current_user.id))
    total = total_r.scalar_one()

    async def _agg(col):
        r = await db.execute(select(col.label("label"), func.count(EmailHistory.id).label("count"))
                             .where(EmailHistory.user_id == current_user.id).group_by(col).order_by(func.count(EmailHistory.id).desc()))
        return r.all()

    cat_rows   = await _agg(EmailHistory.predicted_category)
    pri_rows   = await _agg(EmailHistory.predicted_priority)
    tone_rows  = await _agg(EmailHistory.tone)
    intent_rows= await _agg(EmailHistory.intent)
    emo_rows   = await _agg(EmailHistory.emotion)

    avg_conf_r = await db.execute(select(func.avg(EmailHistory.confidence)).where(EmailHistory.user_id == current_user.id))
    avg_conf = avg_conf_r.scalar_one() or 0.0

    avg_score_r = await db.execute(select(func.avg(EmailHistory.ai_confidence_pct)).where(EmailHistory.user_id == current_user.id))
    avg_score = avg_score_r.scalar_one() or 0.0

    urgent_r = await db.execute(select(func.count(EmailHistory.id)).where(EmailHistory.user_id == current_user.id, EmailHistory.is_urgent == True))
    suspicious_r = await db.execute(select(func.count(EmailHistory.id)).where(EmailHistory.user_id == current_user.id, EmailHistory.is_suspicious == True))
    meeting_r = await db.execute(select(func.count(EmailHistory.id)).where(EmailHistory.user_id == current_user.id, EmailHistory.is_meeting_request == True))
    lang_r = await db.execute(select(EmailHistory.detected_language).where(EmailHistory.user_id == current_user.id).distinct())

    return AnalyticsResponse(
        total_replies=total,
        category_breakdown=_breakdown(cat_rows),
        priority_breakdown=_breakdown(pri_rows),
        tone_breakdown=_breakdown(tone_rows),
        intent_breakdown=_breakdown(intent_rows),
        emotion_breakdown=_breakdown(emo_rows),
        avg_confidence=round(float(avg_conf),4),
        avg_reply_score=round(float(avg_score),2),
        urgent_count=urgent_r.scalar_one(),
        suspicious_count=suspicious_r.scalar_one(),
        meeting_requests_count=meeting_r.scalar_one(),
        languages_detected=[r[0] for r in lang_r.all() if r[0]],
    )
