from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from services.spotify import (
    SpotifyAPI,
    SpotifyAPIError,
    SpotifyConfig,
    SpotifyNotConfiguredError,
)
from functools import lru_cache

router = APIRouter(prefix="/api", tags=["recommendations"])


@lru_cache
def get_spotify_api() -> SpotifyAPI:
    return SpotifyAPI(SpotifyConfig.from_env())


MOOD_TO_SPOTIFY_PARAMS = {
    "Szczęśliwy": {
        "seed_genres": ["happy", "pop", "dance"],
        "target_valence": 0.8,
        "target_energy": 0.7,
        "target_danceability": 0.8,
    },
    "Smutny": {
        "seed_genres": ["sad", "acoustic", "indie"],
        "target_valence": 0.2,
        "target_energy": 0.3,
        "target_danceability": 0.3,
    },
    "Spokojny": {
        "seed_genres": ["ambient", "chill", "acoustic"],
        "target_valence": 0.5,
        "target_energy": 0.3,
        "target_danceability": 0.4,
    },
    "Energiczny": {
        "seed_genres": ["rock", "electronic", "work-out"],
        "target_valence": 0.7,
        "target_energy": 0.9,
        "target_danceability": 0.8,
    },
    "Zaskoczony": {
        "seed_genres": ["indie", "alternative", "pop"],
        "target_valence": 0.6,
        "target_energy": 0.6,
        "target_danceability": 0.6,
    },
}


class MoodRecommendationRequest(BaseModel):
    mood: str
    limit: int = 20


@router.post("/recommendations/songs/", summary="Zwraca rekomendacje piosenek na podstawie nastroju")
async def get_song_recommendations(
    req: MoodRecommendationRequest,
    spotify_api: SpotifyAPI = Depends(get_spotify_api),
) -> dict[str, Any]:
    valid_moods = ["Szczęśliwy", "Smutny", "Spokojny", "Energiczny", "Zaskoczony"]
    
    if req.mood not in valid_moods:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nieprawidłowy nastrój. Dozwolone wartości: {', '.join(valid_moods)}"
        )
    
    if req.limit < 1 or req.limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit musi być między 1 a 100"
        )
    
    try:
        params = MOOD_TO_SPOTIFY_PARAMS[req.mood]
        recommendations = await spotify_api.get_recommendations(
            seed_genres=params["seed_genres"],
            limit=req.limit,
            target_valence=params.get("target_valence"),
            target_energy=params.get("target_energy"),
            target_danceability=params.get("target_danceability"),
        )
        
        return {
            "mood": req.mood,
            "tracks": recommendations.get("tracks", []),
            "seeds": recommendations.get("seeds", []),
        }
    except SpotifyNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Spotify nie jest skonfigurowany"
        )
    except SpotifyAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        ) from e


@router.post("/recommendations/playlist/", summary="Zwraca rekomendacje playlisty na podstawie nastroju")
async def get_playlist_recommendations(
    req: MoodRecommendationRequest,
    spotify_api: SpotifyAPI = Depends(get_spotify_api),
) -> dict[str, Any]:
    valid_moods = ["Szczęśliwy", "Smutny", "Spokojny", "Energiczny", "Zaskoczony"]
    
    if req.mood not in valid_moods:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nieprawidłowy nastrój. Dozwolone wartości: {', '.join(valid_moods)}"
        )
    
    if req.limit < 1 or req.limit > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit musi być między 1 a 50"
        )
    
    try:
        params = MOOD_TO_SPOTIFY_PARAMS[req.mood]
        recommendations = await spotify_api.get_recommendations(
            seed_genres=params["seed_genres"],
            limit=min(req.limit * 2, 100),
            target_valence=params.get("target_valence"),
            target_energy=params.get("target_energy"),
            target_danceability=params.get("target_danceability"),
        )
        
        tracks = recommendations.get("tracks", [])
        playlist_tracks = tracks[:req.limit] if len(tracks) > req.limit else tracks
        
        return {
            "mood": req.mood,
            "playlist": {
                "name": f"Moodify - {req.mood}",
                "tracks": playlist_tracks,
                "total": len(playlist_tracks),
            },
            "seeds": recommendations.get("seeds", []),
        }
    except SpotifyNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Spotify nie jest skonfigurowany"
        )
    except SpotifyAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        ) from e

