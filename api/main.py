from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pathlib
import os

import firebase_admin
from firebase_admin import credentials

from routes.predict import router as predict_router
from routes.spotify import router as spotify_router
from routes.auth import router as auth_router
from routes.mood import router as mood_router
from routes.health import router as health_router
from routes.getters import router as getter_router

baseDir = pathlib.Path(__file__).parent.parent
load_dotenv(baseDir / ".env")

sa_path = baseDir / "service-account.json"

if sa_path.exists():
    cred = credentials.Certificate(str(sa_path))
    bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "moodify-1c59b.appspot.com")
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