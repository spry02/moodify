from functools import lru_cache
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status

from services.spotify import (
    SpotifyAPI,
    SpotifyAPIError,
    SpotifyConfig,
    SpotifyNotConfiguredError,
)

from dotenv import load_dotenv
import pathlib

from services.firebase import *

baseDir = pathlib.Path(__file__).parent.parent
sa_path = baseDir / "service-account.json"

if sa_path.exists():
    cred = firebase_admin.credentials.Certificate(str(sa_path))
    firebase_admin.initialize_app(cred)
    db=firestore.client()

load_dotenv(baseDir / ".env")

app = FastAPI(title="Moodify API", version="0.1.0")

@lru_cache
def get_spotify_api() -> SpotifyAPI:
    return SpotifyAPI(SpotifyConfig.from_env())


@app.get("/", summary="Testowy endpoint")
async def read_root() -> dict[str, str]:
    create_user_in_firebase(db, "newuser1@example.com", "supersecretpassword1", "New User 1")
    log_into_firebase("newuser1@example.com", "supersecretpassword1")
    return {"message": "Hello World"}


@app.get(
    "/spotify/health",
    summary="Sprawdzenie połączenia ze Spotify API",
)
async def spotify_health_check(
    spotify_api: SpotifyAPI = Depends(get_spotify_api),
) -> dict[str, Any]:
    try:
        details = await spotify_api.token_status(refresh=True)
        return {"status": "ok", "details": details}
    except SpotifyNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Skonfiguruj zmienne środowiskowe SPOTIFY_CLIENT_ID oraz "
                "SPOTIFY_CLIENT_SECRET, aby korzystać z integracji Spotify."
            ),
        )
    except SpotifyAPIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

