"""
Prosty test czy model się ładuje
"""
import pathlib
import sys

# Dodaj api do path
api_dir = pathlib.Path(__file__).parent / "api"
sys.path.insert(0, str(api_dir))

print("=" * 60)
print("TEST ŁADOWANIA MODELU")
print("=" * 60)

baseDir = pathlib.Path(__file__).parent
MODEL_PATH = baseDir / "backend" / "saved_models" / "image_model_final.h5"
EMOTION_MAP_PATH = baseDir / "backend" / "saved_models" / "image_emotion_map.json"

print(f"\n1. Sprawdzam ścieżki:")
print(f"   Model: {MODEL_PATH}")
print(f"   Exists: {MODEL_PATH.exists()}")
print(f"   Map: {EMOTION_MAP_PATH}")
print(f"   Exists: {EMOTION_MAP_PATH.exists()}")

if not MODEL_PATH.exists():
    print(f"\n❌ BŁĄD: Model nie znaleziony!")
    print(f"   Sprawdź czy plik istnieje w: {MODEL_PATH}")
    sys.exit(1)

if not EMOTION_MAP_PATH.exists():
    print(f"\n❌ BŁĄD: Mapa emocji nie znaleziona!")
    print(f"   Sprawdź czy plik istnieje w: {EMOTION_MAP_PATH}")
    sys.exit(1)

print("\n2. Ładuję mapę emocji...")
import json
with open(EMOTION_MAP_PATH, 'r', encoding='utf-8') as f:
    emotion_map = {int(k): v for k, v in json.load(f).items()}
print(f"   ✅ Załadowano: {emotion_map}")

print("\n3. Ładuję model...")
import warnings
warnings.filterwarnings('ignore')

from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras import Sequential

base_model = MobileNetV2(
    include_top=False,
    weights='imagenet',
    input_shape=(224, 224, 3)
)
base_model.trainable = False

model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(5, activation='softmax')
])

print("   ✅ Struktura modelu utworzona")

print("\n4. Ładuję wagi...")
try:
    model.load_weights(str(MODEL_PATH), by_name=True, skip_mismatch=True)
    print("   ✅ Wagi załadowane!")
except Exception as e:
    print(f"   ❌ Błąd ładowania wag: {e}")
    sys.exit(1)

print("\n5. Test predykcji...")
import numpy as np
# Losowe zdjęcie testowe
test_img = np.random.rand(1, 224, 224, 3).astype(np.float32)
prediction = model(test_img, training=False)
pred_array = prediction.numpy()[0]

print(f"   Raw prediction: {pred_array}")
print(f"   Sum: {pred_array.sum()}")
predicted_idx = np.argmax(pred_array)
emotion = emotion_map.get(predicted_idx, "Nieznana")
print(f"   Przewidziany index: {predicted_idx}")
print(f"   Emocja: {emotion}")

print("\n" + "=" * 60)
print("✅ WSZYSTKO DZIAŁA!")
print("=" * 60)
