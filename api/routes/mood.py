from typing import Any
import random
import re
import unicodedata

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from data.mock_songs import MOOD_SONGS

router = APIRouter(prefix="/api", tags=["mood"])


class MoodRequest(BaseModel):
    mood: str
    uid: str | None = None


class TextMoodRequest(BaseModel):
    text: str
    uid: str | None = None


def _normalize_text(value: str) -> str:
    value = value.strip().lower()
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"\s+", " ", value)
    return value


def predict_mood_from_text(text: str) -> str:
    """Very lightweight heuristic classifier for Polish mood descriptions.

    This is a fallback when no ML text model is wired.
    """
    t = _normalize_text(text)
    if not t:
        return "Spokojny"

    energetic = [
        "energi", "pobudz", "trening", "silown", "sport", "bieg", "motyw", "imprez",
        "nakrecon", "adrenal", "zajebi", "mega", "szybko", "akcj", "wkur", "zlosc",
    ]
    happy = [
        "szczes", "rados", "super", "fajnie", "dobrze", "wspan", "usmiech", "koch",
        "podeks", "ekscyt", "spoko", "git",
    ]
    sad = [
        "smut", "przygneb", "zal", "placz", "samot", "depres", "beznad", "slabo",
        "zmecz", "brak sil", "nie mam sil",
    ]
    calm = [
        "spokoj", "relaks", "odprez", "wycis", "chill", "odpocz", "leniw", "medyt",
        "stabiln", "bez stresu",
    ]
    surprised = [
        "zaskocz", "wow", "niespodz", "zdziw", "szok", "nie wierze",
    ]
    fear = [
        "stres", "boje", "strach", "lek", "niepok", "panik", "spiety",
    ]

    def has_any(frags: list[str]) -> bool:
        return any(f in t for f in frags)

    # Priority order: strong signals first
    if has_any(surprised):
        return "Zaskoczony"
    if has_any(energetic):
        return "Energiczny"
    if has_any(sad):
        return "Smutny"
    if has_any(fear):
        return "Spokojny"
    if has_any(calm):
        return "Spokojny"
    if has_any(happy):
        return "Szczęśliwy"

    # Default if ambiguous
    return "Spokojny"


@router.post("/mood/song/", summary="Zwraca utwór na podstawie nastroju")
async def get_mood_song(req: MoodRequest) -> dict[str, Any]:
    valid_moods = ["Szczęśliwy", "Smutny", "Spokojny", "Energiczny", "Zaskoczony"]
    
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
    
    selected_song = random.choice(songs)

    try:
        from services.local_history import append_history_item

        if req.uid:
            append_history_item(
                uid=req.uid,
                source="mood",
                mood=req.mood,
                detected_emotion=None,
                song=selected_song,
            )
    except Exception as e:
        print(f"⚠️ Nie udało się zapisać lokalnej historii: {str(e)}")

    return {"mood": req.mood, "song": selected_song}


@router.post("/text/mood/song/", summary="Zwraca utwór na podstawie nastroju przewidzianego z opisu")
async def get_song_from_text(req: TextMoodRequest) -> dict[str, Any]:
    if not req.text or not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Opis nie może być pusty",
        )

    mood = predict_mood_from_text(req.text)
    songs = MOOD_SONGS.get(mood, [])
    if not songs:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Brak utworów dla nastroju: {mood}",
        )

    selected_song = random.choice(songs)

    try:
        from services.local_history import append_history_item

        if req.uid:
            append_history_item(
                uid=req.uid,
                source="description",
                mood=mood,
                detected_emotion=None,
                song=selected_song,
            )
    except Exception as e:
        print(f"⚠️ Nie udało się zapisać lokalnej historii: {str(e)}")

    return {"mood": mood, "song": selected_song}

