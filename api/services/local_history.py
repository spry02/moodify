from __future__ import annotations

import csv
import pathlib
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any


@dataclass(frozen=True)
class HistoryItem:
    timestamp_utc: str
    source: str
    mood: str
    detected_emotion: str
    title: str
    artist: str
    spotify_id: str


def _base_dir() -> pathlib.Path:
    # api/services/local_history.py -> api/
    return pathlib.Path(__file__).resolve().parent.parent


def _safe_uid(uid: str) -> str:
    # Keep it filesystem-safe. Firebase UID is already safe, but be defensive.
    return "".join(ch for ch in uid if ch.isalnum() or ch in ("-", "_"))[:128] or "anonymous"


def _user_history_path(uid: str) -> pathlib.Path:
    base = _base_dir() / "data" / "user_history"
    base.mkdir(parents=True, exist_ok=True)
    return base / f"{_safe_uid(uid)}.csv"


_HEADER = [
    "timestamp_utc",
    "source",
    "mood",
    "detected_emotion",
    "title",
    "artist",
    "spotify_id",
]


def append_history_item(
    *,
    uid: str,
    source: str,
    mood: str,
    detected_emotion: str | None,
    song: dict[str, Any],
) -> None:
    path = _user_history_path(uid)
    exists = path.exists()

    ts = datetime.now(timezone.utc).isoformat()
    item = HistoryItem(
        timestamp_utc=ts,
        source=source,
        mood=mood,
        detected_emotion=detected_emotion or "",
        title=str(song.get("title", "")),
        artist=str(song.get("artist", "")),
        spotify_id=str(song.get("spotify_id", "")) if song.get("spotify_id") is not None else "",
    )

    with path.open("a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=_HEADER)
        if not exists:
            writer.writeheader()
        writer.writerow(asdict(item))


def read_history_items(*, uid: str, limit: int | None = None) -> list[dict[str, Any]]:
    path = _user_history_path(uid)
    if not path.exists():
        return []

    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # newest first
    rows.reverse()
    if limit is not None:
        rows = rows[: max(0, limit)]
    return rows


def summarize_history(*, uid: str, recent_limit: int = 20) -> dict[str, Any]:
    items = read_history_items(uid=uid, limit=None)

    mood_counts: dict[str, int] = {}
    song_counts: dict[str, int] = {}

    for it in items:
        mood = it.get("mood") or ""
        if mood:
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
        key = f"{it.get('title','')} — {it.get('artist','')}".strip(" —")
        if key:
            song_counts[key] = song_counts.get(key, 0) + 1

    recent = items[: max(0, recent_limit)]

    top_songs = sorted(song_counts.items(), key=lambda kv: kv[1], reverse=True)[:10]

    return {
        "total": len(items),
        "mood_counts": mood_counts,
        "top_songs": [{"label": k, "count": v} for k, v in top_songs],
        "recent": recent,
    }
