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

    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            firebase_admin.get_app()
            decoded = firebase_auth.verify_id_token(token)
            uid = str(decoded.get("uid"))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase Admin nie jest skonfigurowany na serwerze",
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nieprawidłowy token użytkownika",
            )

    try:
        if uid:
            from services.firebase import get_tracks_history_from_firestore
            return get_tracks_history_from_firestore(uid)
            
    except Exception as e:
        print(f"Error occured while getting: {e}")


