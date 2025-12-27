from typing import Any
import random
import json
import io
import pathlib
import datetime

import firebase_admin
from firebase_admin import firestore
from firebase_admin import auth as firebase_auth

from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Header
import numpy as np
import tensorflow as tf
from PIL import Image

from data.mock_songs import MOOD_SONGS
from services.predictions_csv import append_prediction_csv_row

router = APIRouter(prefix="/api", tags=["predict"])

baseDir = pathlib.Path(__file__).parent.parent.parent
MODEL_PATH = baseDir / "backend" / "saved_models" / "image_model_final.h5"
EMOTION_MAP_PATH = baseDir / "backend" / "saved_models" / "image_emotion_map.json"

EMOTION_TO_MOOD = {
    "Szczęście": "Szczęśliwy",
    "Smutek": "Smutny",
    "Strach": "Spokojny",
    "Złość": "Energiczny",
    "Zaskoczenie": "Zaskoczony",
}

_image_model = None
_emotion_map = None


def load_image_model():
    global _image_model, _emotion_map
    
    if _image_model is None:
        print(f"🔍 Szukam modelu w: {MODEL_PATH}")
        print(f"📂 Model exists: {MODEL_PATH.exists()}")
        
        if not MODEL_PATH.exists():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Model obrazowy nie został znaleziony w: {MODEL_PATH}"
            )
        
        print("⏳ Ładuję model...")
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
            print("✅ Model załadowany!")
    
    if _emotion_map is None:
        print(f"🔍 Szukam mapy emocji w: {EMOTION_MAP_PATH}")
        print(f"📂 Map exists: {EMOTION_MAP_PATH.exists()}")
        
        if not EMOTION_MAP_PATH.exists():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Mapa emocji nie została znaleziona w: {EMOTION_MAP_PATH}"
            )
        with open(EMOTION_MAP_PATH, 'r', encoding='utf-8') as f:
            _emotion_map = {int(k): v for k, v in json.load(f).items()}
        print(f"✅ Mapa emocji załadowana: {_emotion_map}")
    
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
        
        print(f"📊 Predykcja (raw): {prediction[0]}")
        predicted_idx = np.argmax(prediction[0])
        print(f"🎯 Przewidziany index: {predicted_idx}")
        emotion = emotion_map.get(predicted_idx, "Szczęście")
        print(f"😊 Wykryta emocja: {emotion}")
        
        return emotion
    except Exception as e:
        print(f"❌ Błąd predykcji: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Błąd podczas przetwarzania obrazu: {str(e)}"
        )


@router.post(
    "/image/mood/song/",
    summary="Zwraca utwór na podstawie nastroju przewidzianego ze zdjęcia"
)
async def get_song_from_image(
    file: UploadFile = File(...),
    uid: str | None = Form(None),
    authorization: str | None = Header(None, alias="Authorization"),
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
    
    # Auth is optional for prediction.
    # If Firebase Admin isn't configured locally, we can still accept `uid` from the form
    # to enable local history per-user.
    provided_uid = uid
    uid = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            decoded = firebase_auth.verify_id_token(token)
            uid = str(decoded.get("uid"))
        except ValueError:
            # Firebase app not initialized (e.g. missing service-account.json).
            # Continue without uid.
            uid = None
        except Exception:
            # If Firebase is configured and token is bad, treat as unauthorized.
            # If Firebase isn't configured, verify_id_token can also fail; in that
            # case we still allow anonymous prediction.
            try:
                firebase_admin.get_app()
            except ValueError:
                uid = None
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Nieprawidłowy token użytkownika",
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

    # Local history (works without Firebase)
    try:
        from services.local_history import append_history_item

        history_uid = uid or provided_uid
        if history_uid:
            append_history_item(
                uid=history_uid,
                source="camera",
                mood=mood,
                detected_emotion=emotion,
                song=selected_song,
            )
    except Exception as e:
        print(f"⚠️ Nie udało się zapisać lokalnej historii: {str(e)}")

    # TODO
    # DO NAPRAWIENIA WYPIERDALA BLAD I CHUJ 
    # 
    # if uid:
    #     try:
    #         print("Appending prediction to CSV for user:", uid, "emotion:", emotion, "mood:", mood)
    #         append_prediction_csv_row(uid=uid, detected_emotion=emotion, mood=mood)
    #     except Exception as e:
    #         raise HTTPException(
    #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #             detail=f"Nie udało się zapisać historii predykcji: {str(e)}",
    #         )

    if uid:
        try:
            date = datetime.datetime.now()
            selected_song['date'] = f"{date.day}-{date.month}-{date.year}T{date.hour}:{date.minute}:{date.second}"
            mood_data = {
                "detected_emotion": emotion,
                "mood": mood,
                "song": selected_song,
                "generated_at": firestore.SERVER_TIMESTAMP
            }
            print(selected_song)
            from services.firebase import save_mood_to_firestore
            save_mood_to_firestore(uid, mood_data)
        except Exception as e:
            # Saving history should never break prediction.
            print(f"⚠️ Nie udało się zapisać historii nastroju: {str(e)}")
    
    return {
        "detected_emotion": emotion,
        "mood": mood,
        "song": selected_song
    }

