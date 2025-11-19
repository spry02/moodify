import os
import json
from typing import Any, Dict, Optional

import httpx
import firebase_admin
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
        db.collection('users').document(user.uid).set({
            'email': user.email,
            'display_name': user.display_name
        })
        print(f'Successfully created new user: {user.uid}')
    except Exception as e:
        print(f'Error creating user: {e}')

def log_into_firebase(email: str, password: str) -> None:
    """Sign in using Firebase Auth REST API (email/password).

    Requires environment variable `FIREBASE_API_KEY` set to the project's Web API Key.
    Returns the parsed JSON response from the Identity Toolkit endpoint.
    """
    api_key = "AIzaSyBVIpzHSETzGNIVN7kj6kp4pGIbun_OqRU"
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