from typing import Any
import random

from fastapi import APIRouter, HTTPException, status, Header, Form
from pydantic import BaseModel
import firebase_admin
from firebase_admin import auth as firebase_auth

router = APIRouter(prefix="/api", tags=["getters"])


class SongsRequest(BaseModel):
    mood: str


@router.post("/getters/tracks/", summary="Zwraca utwory z bazy danych")
async def get_mood_song(uid: str | None = Form(None),
                        authorization: str | None = Header(None, alias="Authorization"),) -> dict[str, Any]:
    # Only allow access to history when token verification succeeds.
    # If Firebase Admin isn't configured locally, return empty history.
    uid = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            decoded = firebase_auth.verify_id_token(token)
            uid = str(decoded.get("uid"))
        except ValueError:
            uid = None
        except Exception:
            try:
                firebase_admin.get_app()
            except ValueError:
                uid = None
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Nieprawidłowy token użytkownika",
                )

    if not uid:
        return {}

    try:
        from services.firebase import get_tracks_history_from_firestore
        result = get_tracks_history_from_firestore(uid)
        return result or {}
    except Exception as e:
        print(f"Error occured while getting: {e}")
        return {}


