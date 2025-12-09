from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pathlib

import firebase_admin
from firebase_admin import credentials, firestore

from routes.predict import router as predict_router
from routes.spotify import router as spotify_router
from routes.auth import router as auth_router
from routes.mood import router as mood_router
from routes.health import router as health_router

baseDir = pathlib.Path(__file__).parent.parent
sa_path = baseDir / "service-account.json"

if sa_path.exists():
    cred = credentials.Certificate(str(sa_path))
    firebase_admin.initialize_app(cred)

load_dotenv(baseDir / ".env")

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