# Dokumentacja Firebase - Moodify

Dokumentacja opisuje konfigurację, strukturę danych oraz usługi Firebase wykorzystywane w projekcie Moodify.

## 1. Informacje Ogólne

*   **ID Projektu**: `moodify-1c59b`
*   **Domena Auth**: `moodify-1c59b.firebaseapp.com`
*   **Bucket Storage**: `moodify-1c59b.appspot.com`
*   **Hosting**: Skonfigurowany dla aplikacji typu SPA (Single Page Application)

## 2. Konfiguracja Klienta (Frontend)

Inicjalizacja po stronie klienta znajduje się w pliku `frontend/src/components/firebase/firebase.ts`. Aplikacja wykorzystuje modułowe SDK Firebase v9+.

### Zainicjalizowane usługi
*   **Authentication** (`getAuth`)
*   **Firestore** (`getFirestore`)

### Obiekt konfiguracyjny
Kod zawiera jawną konfigurację dla środowiska produkcyjnego/deweloperskiego:
*   authDomain: `moodify-1c59b.firebaseapp.com`
*   projectId: `moodify-1c59b`
*   storageBucket: `moodify-1c59b.appspot.com`
*   messagingSenderId: `102165390463`
*   appId: `1:102165390463:web:02c5ffb694692230063b6c`

## 3. Konfiguracja Serwera (Backend)

Backend napisany w Pythonie (FastAPI) wykorzystuje `firebase-admin` SDK do operacji uprzywilejowanych.

### Inicjalizacja
Lokalizacja: `api/main.py`
Serwer szuka pliku klucza konta serwisowego `service-account.json` w głównym katalogu. Jeśli plik istnieje, aplikacja jest inicjalizowana z uprawnieniami administratora i dostępem do Storage Bucket.

### Zmienne środowiskowe
Wymagane zmienne w pliku `.env` dla obsługi Firebase:
*   `FIREBASE_API_KEY`: Klucz Web API wymagany do logowania użytkowników przez REST API.
*   `FIREBASE_STORAGE_BUCKET`: (Opcjonalnie) Adres bucketu, domyślnie `moodify-1c59b.appspot.com`.

## 4. Uwierzytelnianie

System obsługuje uwierzytelnianie hybrydowe, łącząc SDK klienta z REST API po stronie serwera.

### Metody logowania
*   **Email/Hasło**: Główna metoda uwierzytelniania.

### Backend API (`api/services/firebase.py`)
Backend udostępnia funkcje pomocnicze:
1.  **create_user_in_firebase**: Tworzy użytkownika przy użyciu `auth.create_user` (Admin SDK). Ustawia `email`, `password` oraz `display_name`.
2.  **log_into_firebase**: Wykonuje żądanie HTTP POST do `identitytoolkit.googleapis.com` w celu zalogowania użytkownika hasłem i uzyskania tokena (ponieważ Admin SDK nie służy do logowania użytkowników hasłami).

### Frontend
Frontend nasłuchuje zmian stanu uwierzytelnienia za pomocą `onAuthStateChanged` w pliku `App.tsx`, co pozwala na warunkowe renderowanie widoków (`MainDashboard` vs `AuthPopup`).

## 5. Baza Danych (Cloud Firestore)

Projekt wykorzystuje bazę NoSQL Firestore do przechowywania historii nastrojów użytkowników.

### Struktura Kolekcji

#### Kolekcja `users`
Główna kolekcja przechowująca dokumenty użytkowników.
*   **ID Dokumentu**: UID użytkownika (z Firebase Auth)

#### Podkolekcja `moods`
Ścieżka: `users/{uid}/moods`
Przechowuje historię wygenerowanych nastrojów i przypisanych piosenek.

**Schemat dokumentu w `moods`:**
*   `artist` (string): Wykonawca rekomendowanej piosenki
*   `date` (string): Data generowania w odpowiednim formacie
*   `desc` (string/null): Wykonawca rekomendowanej piosenki
*   `duration_ms` (int): Długość piosenki w ms
*   `generated_at` (date): Timestamp z serwera Firestore
*   `mood` (string): Przewidziany nastrój
*   `name` (string): Tytuł piosenki
*   `source` (string): Informacja, z którego modułu korzystał użytkownik
*   `spotify_id` (string): ID piosenki ze Spotify
*   `spotify_url` (string): Link do piosenki ze Spotify

## 6. Operacje na Danych (Serwisy)

Backend (`api/services/firebase.py`) implementuje następujące operacje na bazie danych:

*   **save_mood_to_firestore(uid, mood_data)**: Dodaje nowy dokument do kolekcji `moods` danego użytkownika.
*   **get_tracks_history_from_firestore(uid)**: Pobiera wszystkie dokumenty z podkolekcji `moods` dla danego użytkownika i zwraca je w formie słownika, gdzie kluczem jest ID dokumentu, a wartością dane utworu.

## 8. Endpointy API powiązane z Firebase

Zgodnie z dokumentacją API (`frontend/api_docs.md`), następujące endpointy interaktywują z Firebase:

*   **POST /api/firebase/login/**: Logowanie użytkownika (zwraca UID i token).
*   **POST /api/recommendations/songs/**: Zapisuje piosenkę i wszystkie informacje do Firestore, jeśli podano UID.