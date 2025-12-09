from typing import Any
import random

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from data.mock_songs import MOOD_SONGS

router = APIRouter(prefix="/api", tags=["mood"])


class MoodRequest(BaseModel):
    mood: str


@router.post("/mood/song/", summary="Zwraca utwór na podstawie nastroju")
async def get_mood_song(req: MoodRequest) -> dict[str, Any]:
    valid_moods = ["Szczęśliwy", "Smutny", "Zestresowany", "Spokojny", "Zmęczony"]
    
    if req.mood not in valid_moods:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nieprawidłowy nastrój. Dozwolone wartości: {', '.join(valid_moods)}"
        )
    
    songs = MOOD_SONGS.get(req.mood, [])
    if not songs:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Brak utworów dla tego nastroju"
        )
    
    return {
        "mood": req.mood,
        "song": random.choice(songs)
    }

