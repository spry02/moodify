from __future__ import annotations

from typing import Any

import firebase_admin
from firebase_admin import auth as firebase_auth
from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel

from services.firebase import get_history_items_from_firestore, summarize_history_from_firestore

router = APIRouter(prefix="/api", tags=["history"])


class HistoryRequest(BaseModel):
    uid: str
    limit: int | None = None


class HistorySummaryRequest(BaseModel):
    uid: str


def _resolve_uid(uid: str | None, authorization: str | None) -> str | None:
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            decoded = firebase_auth.verify_id_token(token)
            token_uid = decoded.get("uid")
            return str(token_uid) if token_uid else None
        except ValueError:
            # Firebase app not initialized (e.g. missing service-account.json).
            pass
        except Exception:
            try:
                firebase_admin.get_app()
            except ValueError:
                pass
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Nieprawidlowy token uzytkownika",
                )
    return uid


@router.post("/history/items/", summary="Zwraca historie rekomendacji uzytkownika (Firebase)")
async def history_items(
    req: HistoryRequest,
    authorization: str | None = Header(None, alias="Authorization"),
) -> list[dict[str, Any]]:
    uid = _resolve_uid(req.uid, authorization)
    if not uid:
        return []
    return get_history_items_from_firestore(uid=uid, limit=req.limit or 50)


@router.post("/history/summary/", summary="Zwraca podsumowanie historii (Firebase)")
async def history_summary(
    req: HistorySummaryRequest,
    authorization: str | None = Header(None, alias="Authorization"),
) -> dict[str, Any]:
    uid = _resolve_uid(req.uid, authorization)
    if not uid:
        return {"total": 0, "mood_counts": {}, "top_songs": [], "recent": []}
    return summarize_history_from_firestore(uid=uid, recent_limit=20)
