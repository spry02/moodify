from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from services.firebase import log_into_firebase

router = APIRouter(prefix="/api", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    passwd: str


@router.post("/firebase/login/", summary="Logowanie do Firebase")
async def firebase_login(req: LoginRequest) -> dict[str, Any]:
    try:
        uid = log_into_firebase(req.email, req.passwd)
        return {
            "status": "ok",
            "uid": uid["localId"],
            "token": uid["idToken"],
            "displayName": uid["displayName"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        ) from e

