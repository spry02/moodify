# API Documentation

Base URL: `http://localhost:8000`

## Health

### GET /
Testowy endpoint

**Response:**
```json
{
  "message": "Hello World"
}
```

## Spotify

### GET /spotify/health
Sprawdzenie połączenia ze Spotify API

**Response:**
```json
{
  "status": "ok",
  "details": { ... }
}
```

**Errors:**
- `503` - Spotify nie skonfigurowany
- `502` - Błąd połączenia ze Spotify

## Auth

### POST /api/firebase/login/
Logowanie do Firebase

**Request Body:**
```json
{
  "email": "string",
  "passwd": "string"
}
```

**Response:**
```json
{
  "status": "ok",
  "uid": "string",
  "token": "string",
  "displayName": "string"
}
```

**Errors:**
- `502` - Błąd logowania

## Mood

### POST /api/mood/song/
Zwraca utwór na podstawie nastroju

**Request Body:**
```json
{
  "mood": "Szczęśliwy" | "Smutny" | "Zestresowany" | "Spokojny" | "Zmęczony"
}
```

**Response:**
```json
{
  "mood": "Szczęśliwy",
  "song": {
    "title": "string",
    "artist": "string",
    "spotify_id": "string"
  }
}
```

**Errors:**
- `400` - Nieprawidłowy nastrój
- `500` - Brak utworów dla nastroju

## Predict

### POST /api/image/mood/song/
Zwraca utwór na podstawie nastroju przewidzianego ze zdjęcia

**Request:** `multipart/form-data`
- `file`: Image file (jpg, png, jpeg)

**Response:**
```json
{
  "detected_emotion": "Szczęście" | "Smutek" | "Strach" | "Złość" | "Zaskoczenie",
  "mood": "Szczęśliwy" | "Smutny" | "Zestresowany" | "Spokojny" | "Zmęczony",
  "song": {
    "title": "string",
    "artist": "string",
    "spotify_id": "string"
  }
}
```

**Errors:**
- `400` - Plik nie jest obrazem / Błąd przetwarzania
- `500` - Brak utworów dla nastroju
