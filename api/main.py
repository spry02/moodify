from functools import lru_cache
from typing import Any
import random

from fastapi import Depends, FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware

from services.spotify import (
    SpotifyAPI,
    SpotifyAPIError,
    SpotifyConfig,
    SpotifyNotConfiguredError,
)

from dotenv import load_dotenv
import pathlib

from services.firebase import *
from data.mock_songs import MOOD_SONGS

baseDir = pathlib.Path(__file__).parent.parent
sa_path = baseDir / "service-account.json"

if sa_path.exists():
    cred = firebase_admin.credentials.Certificate(str(sa_path))
    firebase_admin.initialize_app(cred)
    db=firestore.client()

load_dotenv(baseDir / ".env")

app = FastAPI(title="Moodify API", version="0.1.0")

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@lru_cache
def get_spotify_api() -> SpotifyAPI:
    return SpotifyAPI(SpotifyConfig.from_env())


@app.get("/", summary="Testowy endpoint")
async def read_root() -> dict[str, str]:
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


@app.post(
    "/api/firebase/login/",
    summary="Logowanie do Firebase"
)
async def firebase_login(request: Request) -> dict[str, Any]:
    req = await request.json()
    
    email = req.get("email")
    passwd = req.get("passwd")
    try:
        uid = log_into_firebase(email, passwd)
        return {"status": "ok", "uid": uid["localId"], "token": uid["idToken"], "displayName": uid["displayName"]}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        ) from e


@app.post(
    "/api/mood/song/",
    summary="Zwraca utwór na podstawie nastroju"
)
async def get_mood_song(request: Request) -> dict[str, Any]:
    req = await request.json()
    mood = req.get("mood")
    
    valid_moods = ["Szczęśliwy", "Smutny", "Zestresowany", "Spokojny", "Zmęczony"]
    
    if mood not in valid_moods:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nieprawidłowy nastrój. Dozwolone wartości: {', '.join(valid_moods)}"
        )
    
    songs = MOOD_SONGS.get(mood, [])
    if not songs:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Brak utworów dla tego nastroju"
        )
    
    selected_song = random.choice(songs)
    return {
        "mood": mood,
        "song": selected_song
    }