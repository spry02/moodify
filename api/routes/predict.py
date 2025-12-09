from typing import Any
import random
import json
import io
import pathlib

from fastapi import APIRouter, HTTPException, status, UploadFile, File
import numpy as np
import tensorflow as tf
from PIL import Image

from data.mock_songs import MOOD_SONGS

router = APIRouter(prefix="/api", tags=["predict"])

baseDir = pathlib.Path(__file__).parent.parent.parent
MODEL_PATH = baseDir / "backend" / "saved_models" / "image_model_final.h5"
EMOTION_MAP_PATH = baseDir / "backend" / "saved_models" / "image_emotion_map.json"

EMOTION_TO_MOOD = {
    "Szczęście": "Szczęśliwy",
    "Smutek": "Smutny",
    "Strach": "Zestresowany",
    "Złość": "Zestresowany",
    "Zaskoczenie": "Spokojny",
}

_image_model = None
_emotion_map = None


def load_image_model():
    global _image_model, _emotion_map
    
    if _image_model is None:
        if not MODEL_PATH.exists():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model obrazowy nie został znaleziony"
            )
        
        import warnings
        with warnings.catch_warnings():
            warnings.filterwarnings('ignore', category=UserWarning)
            
            from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2
            from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
            from tensorflow.keras import Sequential
            
            base_model = MobileNetV2(
                include_top=False,
                weights='imagenet',
                input_shape=(224, 224, 3)
            )
            base_model.trainable = False
            
            _image_model = Sequential([
                base_model,
                GlobalAveragePooling2D(),
                Dense(128, activation='relu'),
                Dropout(0.5),
                Dense(5, activation='softmax')
            ])
            
            _image_model.load_weights(str(MODEL_PATH), by_name=True, skip_mismatch=True)
    
    if _emotion_map is None:
        if not EMOTION_MAP_PATH.exists():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Mapa emocji nie została znaleziona"
            )
        with open(EMOTION_MAP_PATH, 'r', encoding='utf-8') as f:
            _emotion_map = {int(k): v for k, v in json.load(f).items()}
    
    return _image_model, _emotion_map


def predict_emotion_from_image(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert('RGB')
        image = image.resize((224, 224))
        
        img_array = np.array(image, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        model, emotion_map = load_image_model()
        
        prediction = model(img_array, training=False)
        if isinstance(prediction, tf.Tensor):
            prediction = prediction.numpy()
        
        predicted_idx = np.argmax(prediction[0])
        emotion = emotion_map.get(predicted_idx, "Szczęście")
        return emotion
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Błąd podczas przetwarzania obrazu: {str(e)}"
        )


@router.post(
    "/image/mood/song/",
    summary="Zwraca utwór na podstawie nastroju przewidzianego ze zdjęcia"
)
async def get_song_from_image(
    file: UploadFile = File(...)
) -> dict[str, Any]:
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plik musi być obrazem"
        )
    
    try:
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Błąd podczas wczytywania pliku: {str(e)}"
        )
    
    emotion = predict_emotion_from_image(image_bytes)
    
    mood = EMOTION_TO_MOOD.get(emotion, "Szczęśliwy")
    
    songs = MOOD_SONGS.get(mood, [])
    if not songs:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Brak utworów dla nastroju: {mood}"
        )
    
    selected_song = random.choice(songs)
    
    return {
        "detected_emotion": emotion,
        "mood": mood,
        "song": selected_song
    }

