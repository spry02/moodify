from typing import Any
from functools import lru_cache
from pathlib import Path
import random
import re
import unicodedata

from fastapi import APIRouter, HTTPException, status
from firebase_admin import firestore
from pydantic import BaseModel

from data.mock_songs import MOOD_SONGS

router = APIRouter(prefix="/api", tags=["mood"])

ROOT_DIR = Path(__file__).resolve().parents[2]
TEXT_MODEL_DIR = ROOT_DIR / "backend" / "saved_models"


EMOTION_TO_MOOD: dict[str, str] = {
    "Szczęście": "Szczęśliwy",
    "Smutek": "Smutny",
    "Strach": "Spokojny",
    "Złość": "Energiczny",
    "Zaskoczenie": "Zaskoczony",
}


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


@lru_cache(maxsize=1)
def _load_text_emotion_model():
    """Load TF-IDF vectorizer + SVM text emotion model.

    Returns:
        (vectorizer, svm)
    """
    try:
        import joblib
    except Exception as e:  # pragma: no cover
        raise RuntimeError(
            "Brak zależności do modelu tekstowego. Zainstaluj scikit-learn/joblib."
        ) from e

    vectorizer_path = TEXT_MODEL_DIR / "tfidf_vectorizer.pkl"
    svm_path = TEXT_MODEL_DIR / "svm_text_model.pkl"

    if not vectorizer_path.exists() or not svm_path.exists():
        raise FileNotFoundError(
            f"Brak plików modelu tekstowego: {vectorizer_path} / {svm_path}"
        )

    vectorizer = joblib.load(vectorizer_path)
    svm = joblib.load(svm_path)
    return vectorizer, svm


def predict_emotion_from_text(text: str) -> str | None:
    """Predict a Polish emotion label from text using the trained SVM model.

    Returns None if the model is unavailable.
    """
    try:
        vectorizer, svm = _load_text_emotion_model()
        pred = svm.predict(vectorizer.transform([text]))
        if pred is None:
            return None
        emotion = str(pred[0])
        return emotion
    except Exception as e:
        # Keep the endpoint reliable even when the ML model cannot load.
        print(f"⚠️ Model tekstowy niedostępny, fallback do heurystyki: {str(e)}")
        return None


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


def mood_from_emotion(emotion: str) -> str:
    return EMOTION_TO_MOOD.get(emotion, "Spokojny")


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

    if req.uid:
        try:
            mood_data = {
                "detected_emotion": None,
                "mood": req.mood,
                "source": "mood",
                "song": selected_song,
                "generated_at": firestore.SERVER_TIMESTAMP,
            }
            from services.firebase import save_mood_to_firestore
            save_mood_to_firestore(req.uid, mood_data)
        except Exception as e:
            print(f"Nie udalo sie zapisac historii w Firebase: {str(e)}")

    return {"mood": req.mood, "song": selected_song}


@router.post("/text/mood/song/", summary="Zwraca utwór na podstawie nastroju przewidzianego z opisu")
async def get_song_from_text(req: TextMoodRequest) -> dict[str, Any]:
    if not req.text or not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Opis nie może być pusty",
        )

    detected_emotion = predict_emotion_from_text(req.text)
    mood = mood_from_emotion(detected_emotion) if detected_emotion else predict_mood_from_text(req.text)
    songs = MOOD_SONGS.get(mood, [])
    if not songs:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Brak utworów dla nastroju: {mood}",
        )

    selected_song = random.choice(songs)

    if req.uid:
        try:
            mood_data = {
                "detected_emotion": detected_emotion,
                "mood": mood,
                "source": "description",
                "song": selected_song,
                "generated_at": firestore.SERVER_TIMESTAMP,
            }
            from services.firebase import save_mood_to_firestore
            save_mood_to_firestore(req.uid, mood_data)
        except Exception as e:
            print(f"Nie udalo sie zapisac historii w Firebase: {str(e)}")

    return {"detected_emotion": detected_emotion, "mood": mood, "song": selected_song}


