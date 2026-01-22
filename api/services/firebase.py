from typing import Any, Dict, Optional
from datetime import datetime, timezone, timedelta
import os

import httpx
from firebase_admin import auth, firestore

def create_user_in_firebase(db, email: str, password: str, display_name: str) -> None:
    try:
        user = auth.create_user(
            email=email,
            email_verified=False,
            password=password,
            display_name=display_name,
            disabled=False
        )
        print(f'Successfully created new user: {user.uid}')
    except Exception as e:
        print(f'Error creating user: {e}')

def log_into_firebase(email: str, password: str) -> None:
    """Sign in using Firebase Auth REST API (email/password).

    Requires environment variable `FIREBASE_API_KEY` set to the project's Web API Key.
    Returns the parsed JSON response from the Identity Toolkit endpoint.
    """
    api_key = os.getenv("FIREBASE_API_KEY")
    if not api_key:
        raise RuntimeError("FIREBASE_API_KEY is not set in environment")

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    payload = {"email": email, "password": password, "returnSecureToken": True}

    with httpx.Client(timeout=10.0) as client:
        resp = client.post(url, json=payload)
    try:
        resp.raise_for_status()
        print(f"Successfully signed in user: {resp.json()}")
    except:
        print(f"Error signing in user: {resp.status_code} {resp.text}")

    return resp.json()

def save_mood_to_firestore(uid: str, mood_data: Dict[str, Any]) -> None:
    """Save mood data to Firestore under the user's document."""
    try:
        db = firestore.client()
        user_ref = db.collection('users').document(uid)
        moods_ref = user_ref.collection('moods')
        moods_ref.add(mood_data)
        print(f"Successfully saved mood data for user: {uid}")
    except Exception as e:
        print(f"Error saving mood data: {e}")

def get_tracks_history_from_firestore(uid: str) -> Optional[Dict[str, Any]]:
    try:
        db = firestore.client()
        users_ref = db.collection('users').document(uid)
        moods_ref = users_ref.collection('moods')
        docs = moods_ref.stream()
        songlist = {}
        # print(docs)
        for doc in docs:
            songlist[doc.id] = doc.to_dict()['song']
            # print(f"{doc.id} => {doc.to_dict()}")
            print(songlist)
        return songlist
    except Exception as e:
        print(f"Error getting records: {e}")


def _format_timestamp(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        ts = value
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return ts.astimezone(timezone(timedelta(hours=1))).isoformat(timespec='seconds')
    if hasattr(value, "to_datetime"):
        try:
            ts = value.to_datetime()
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            return ts.astimezone(timezone.utc).isoformat()
        except Exception:
            pass
    return str(value)


def _history_item_from_doc(doc) -> Dict[str, Any]:
    data = doc.to_dict() or {}
    if not isinstance(data, dict):
        data = {}

    timestamp_value = data.get("generated_at")

    return {
        "timestamp_utc": _format_timestamp(timestamp_value),
        "title": str(data.get("name") or ""),
        "artist": str(data.get("artist") or ""),
        "spotify_id": str(data.get("spotify_id") or ""),
        "spotify_url": str(data.get("spotify_url") or "")
    }


def get_history_items_from_firestore(uid: str, limit: int | None = None) -> list[Dict[str, Any]]:
    db = firestore.client()
    moods_ref = db.collection("users").document(uid).collection("moods")

    docs = []
    try:
        query = moods_ref.order_by("generated_at", direction=firestore.Query.DESCENDING)
        if limit is not None:
            query = query.limit(limit)
        docs = list(query.stream())
    except Exception:
        docs = list(moods_ref.stream())
        docs.sort(key=lambda d: getattr(d, "create_time", None), reverse=True)
        if limit is not None:
            docs = docs[: max(0, limit)]

    return [_history_item_from_doc(doc) for doc in docs]


def summarize_history_from_firestore(uid: str, recent_limit: int = 20) -> Dict[str, Any]:
    items = get_history_items_from_firestore(uid, limit=None)

    mood_counts: Dict[str, int] = {}
    song_counts: Dict[str, int] = {}

    for it in items:
        mood = it.get("mood") or ""
        if mood:
            mood_counts[mood] = mood_counts.get(mood, 0) + 1

        title = it.get("title") or ""
        artist = it.get("artist") or ""
        label = " - ".join([part for part in [title, artist] if part]).strip()
        if label:
            song_counts[label] = song_counts.get(label, 0) + 1

    recent = items[: max(0, recent_limit)]
    top_songs = sorted(song_counts.items(), key=lambda kv: kv[1], reverse=True)[:10]

    return {
        "total": len(items),
        "mood_counts": mood_counts,
        "top_songs": [{"label": k, "count": v} for k, v in top_songs],
        "recent": recent,
    }
