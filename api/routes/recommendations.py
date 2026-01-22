import random
from typing import Any
from enum import Enum
from functools import lru_cache

import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from firebase_admin import firestore

from services.spotify import (
    SpotifyAPI,
    SpotifyAPIError,
    SpotifyConfig,
    SpotifyNotConfiguredError,
)

router = APIRouter(prefix="/api", tags=["recommendations"])

class Mood(str, Enum):
    HAPPY = "Szczęśliwy"
    SAD = "Smutny"
    CALM = "Spokojny"
    ENERGETIC = "Energiczny"
    SURPRISED = "Zaskoczony"


MOOD_QUERIES = {
    Mood.HAPPY: "happy hits feel good pop summer",
    Mood.SAD: "sad songs piano melancholic acoustic",
    Mood.CALM: "chill ambient relax study music",
    Mood.ENERGETIC: "workout high energy rock electronic dance",
    Mood.SURPRISED: "viral hits experimental alternative new music",
}

@lru_cache
def get_spotify_api() -> SpotifyAPI:
    return SpotifyAPI(SpotifyConfig.from_env())

class MoodRecommendationRequest(BaseModel):
    mood: Mood
    uid: str
    source: str
    desc: str = None
    limit: int = Field(default=20, ge=1, le=50, description="Limit wyników do przeszukania")

@router.post("/recommendations/songs/", summary="Zwraca losową piosenkę na podstawie nastroju")
async def get_song_recommendations(
    req: MoodRecommendationRequest,
    spotify_api: SpotifyAPI = Depends(get_spotify_api),
) -> dict[str, Any]:
    
    query = MOOD_QUERIES.get(req.mood, "top global hits")
    
    try:
        search_result = await spotify_api.search_tracks(query=query, limit=50)
        
        tracks = search_result.get("tracks", {}).get("items", [])
        
        if not tracks:
            raise HTTPException(
                status_code=404, 
                detail=f"Nie znaleziono utworów dla nastroju: {req.mood.value}"
            )

        random_track = random.choice(tracks)

        if req.uid:
            try:
                date = datetime.datetime.now()
                db_date=f"{date.day}-{date.month}-{date.year}T{date.hour}:{date.minute}:{date.second}"
                mood_data = {
                    "mood": req.mood,
                    "name": random_track.get("name"),
                    "artist": random_track["artists"][0]["name"] if random_track.get("artists") else "Unknown",
                    "spotify_url": random_track["external_urls"].get("spotify"),
                    "spotify_id": random_track.get("id"),
                    "preview_url": random_track.get("preview_url"),
                    "duration_ms": random_track.get("duration_ms"),
                    "source": req.source,
                    "desc": req.desc,
                    "date": db_date,
                    "generated_at": firestore.SERVER_TIMESTAMP
                }

                from services.firebase import save_mood_to_firestore
                save_mood_to_firestore(req.uid, mood_data)
            except Exception as e:
                print(f"Nie udało się zapisać historii nastroju: {str(e)}")

        return {
            "mood": req.mood.value,
            "track": random_track,
            "simple_info": {
                "name": random_track.get("name"),
                "artist": random_track["artists"][0]["name"] if random_track.get("artists") else "Unknown",
                "spotify_url": random_track["external_urls"].get("spotify"),
                "spotify_id": random_track.get("id"),
                "preview_url": random_track.get("preview_url"),
                "duration_ms": random_track.get("duration_ms"),
                "image": random_track["album"]["images"][0]["url"] if random_track.get("album") and random_track["album"].get("images") else None
            }
        }
        
    except SpotifyNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serwis Spotify nie jest skonfigurowany."
        )
    except SpotifyAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Błąd API Spotify: {str(e)}",
        )

@router.post("/recommendations/playlist/", summary="Generuje playlistę na podstawie nastroju")
async def get_playlist_recommendations(
    req: MoodRecommendationRequest,
    spotify_api: SpotifyAPI = Depends(get_spotify_api),
) -> dict[str, Any]:
    
    query = MOOD_QUERIES.get(req.mood, "top hits")
    
    try:
        search_result = await spotify_api.search_tracks(query=query, limit=req.limit)
        tracks = search_result.get("tracks", {}).get("items", [])
        
        random.shuffle(tracks)

        return {
            "mood": req.mood.value,
            "playlist": {
                "name": f"Moodify - {req.mood.value}",
                "description": f"Playlista wygenerowana dla: {req.mood.value}",
                "tracks": tracks,
                "total_tracks": len(tracks),
            },
        }
    except SpotifyNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serwis Spotify nie jest skonfigurowany."
        )
    except SpotifyAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Błąd API Spotify: {str(e)}",
        )