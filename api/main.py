from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pathlib
import os
import firebase_admin
from firebase_admin import credentials

baseDir = pathlib.Path(__file__).parent.parent
env_path = baseDir / "api/.env"

if not env_path.exists():
    print(f"Creating default .env")
    try:
        with open(".env", "w") as f:
            f.write('''ENV=dev
GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
FIREBASE_API_KEY="AIzaSyBVIpzHSETzGNIVN7kj6kp4pGIbun_OqRU"
SPOTIFY_CLIENT_ID="CHANGE_ME"
SPOTIFY_CLIENT_SECRET="CHANGE_ME"
                    ''')
            f.close()
        raise ValueError
    except ValueError:
        print(f"Please go to .env file and configure Spotify API values")

load_dotenv(env_path)

print(f"Loading .env from: {env_path}")
print(f"SPOTIFY_API_BASE_URL loaded as: {os.getenv('SPOTIFY_API_BASE_URL')}")

from routes.predict import router as predict_router
from routes.spotify import router as spotify_router
from routes.auth import router as auth_router
from routes.mood import router as mood_router
from routes.health import router as health_router
from routes.getters import router as getter_router
from routes.history import router as history_router
from routes.recommendations import router as recommendations_router

sa_path = baseDir / "service-account.json"

if sa_path.exists():
    cred = credentials.Certificate(str(sa_path))
    bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "moodify-1c59b.appspot.com")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred, {"storageBucket": bucket})
        print("Firebase initialized.")

app = FastAPI(title="Moodify API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(spotify_router)
app.include_router(auth_router)
app.include_router(mood_router)
app.include_router(predict_router)
app.include_router(getter_router)
app.include_router(history_router)
app.include_router(recommendations_router)