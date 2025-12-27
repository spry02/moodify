from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header
from pydantic import BaseModel

from services.local_history import read_history_items, summarize_history

router = APIRouter(prefix="/api", tags=["history"])


class HistoryRequest(BaseModel):
    uid: str
    limit: int | None = None


class HistorySummaryRequest(BaseModel):
    uid: str


@router.post("/history/items/", summary="Zwraca historię rekomendacji użytkownika (lokalnie)")
async def history_items(
    req: HistoryRequest,
    authorization: str | None = Header(None, alias="Authorization"),
) -> list[dict[str, Any]]:
    # For local-dev we trust uid from request body.
    # If later Firebase Admin is configured, Authorization can be used server-side.
    _ = authorization
    return read_history_items(uid=req.uid, limit=req.limit or 50)


@router.post("/history/summary/", summary="Zwraca podsumowanie historii (liczniki + ostatnie wpisy)")
async def history_summary(
    req: HistorySummaryRequest,
    authorization: str | None = Header(None, alias="Authorization"),
) -> dict[str, Any]:
    _ = authorization
    return summarize_history(uid=req.uid, recent_limit=20)
