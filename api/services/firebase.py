from typing import Any, Dict, Optional
import os

import httpx
from firebase_admin import auth, firestore

def create_user_in_firebase(db, email: str, password: str, display_name: str) -> None:
    try:
        user = auth.create_user(
            email=email,
            email_verified=False,
            password=password,
            display_name=display_name,
            disabled=False
        )
        print(f'Successfully created new user: {user.uid}')
    except Exception as e:
        print(f'Error creating user: {e}')

def log_into_firebase(email: str, password: str) -> None:
    """Sign in using Firebase Auth REST API (email/password).

    Requires environment variable `FIREBASE_API_KEY` set to the project's Web API Key.
    Returns the parsed JSON response from the Identity Toolkit endpoint.
    """
    api_key = os.getenv("FIREBASE_API_KEY")
    if not api_key:
        raise RuntimeError("FIREBASE_API_KEY is not set in environment")

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    payload = {"email": email, "password": password, "returnSecureToken": True}

    with httpx.Client(timeout=10.0) as client:
        resp = client.post(url, json=payload)
    try:
        resp.raise_for_status()
        print(f"Successfully signed in user: {resp.json()}")
    except:
        print(f"Error signing in user: {resp.status_code} {resp.text}")

    return resp.json()

def save_mood_to_firestore(uid: str, mood_data: Dict[str, Any]) -> None:
    """Save mood data to Firestore under the user's document."""
    try:
        db = firestore.client()
        user_ref = db.collection('users').document(uid)
        moods_ref = user_ref.collection('moods')
        moods_ref.add(mood_data)
        print(f"Successfully saved mood data for user: {uid}")
    except Exception as e:
        print(f"Error saving mood data: {e}")

def get_tracks_history_from_firestore(uid: str) -> Optional[Dict[str, Any]]:
    try:
        db = firestore.client()
        users_ref = db.collection('users').document(uid)
        moods_ref = users_ref.collection('moods')
        docs = moods_ref.stream()
        songlist = {}
        # print(docs)
        for doc in docs:
            songlist[doc.id] = doc.to_dict()['song']
            # print(f"{doc.id} => {doc.to_dict()}")
            # print(songlist)
        return songlist
    except Exception as e:
        print(f"Error getting records: {e}")