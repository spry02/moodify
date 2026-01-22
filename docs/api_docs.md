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
  "mood": "Szczęśliwy" | "Smutny" | "Spokojny" | "Energiczny" | "Zaskoczony"
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

## Recommendations

### POST /api/recommendations/songs/
Zwraca rekomendacje piosenek z Spotify na podstawie nastroju

**Request Body:**
```json
{
  "mood": "Szczęśliwy" | "Smutny" | "Spokojny" | "Energiczny" | "Zaskoczony",
  "limit": 20
}
```

**Response:**
```json
{
  "mood": "Szczęśliwy",
  "tracks": [
    {
      "id": "string",
      "name": "string",
      "artists": [...],
      "album": {...},
      "external_urls": {
        "spotify": "string"
      },
      "preview_url": "string",
      "duration_ms": 0,
      "popularity": 0
    }
  ],
  "seeds": [...]
}
```

**Errors:**
- `400` - Nieprawidłowy nastrój / Limit poza zakresem (1-100)
- `502` - Błąd połączenia ze Spotify
- `503` - Spotify nie skonfigurowany

### POST /api/recommendations/playlist/
Zwraca rekomendacje playlisty z Spotify na podstawie nastroju

**Request Body:**
```json
{
  "mood": "Szczęśliwy" | "Smutny" | "Spokojny" | "Energiczny" | "Zaskoczony",
  "limit": 20
}
```

**Response:**
```json
{
  "mood": "Szczęśliwy",
  "playlist": {
    "name": "Moodify - Szczęśliwy",
    "tracks": [...],
    "total": 20
  },
  "seeds": [...]
}
```

## Recommendations

### POST /api/recommendations/songs/
Zwraca jedną, losową piosenkę pasującą do nastroju (wylosowaną z wyników wyszukiwania Spotify).

**Request Body:**
```json
{
  "mood": "Szczęśliwy" | "Smutny" | "Spokojny" | "Energiczny" | "Zaskoczony",
  "limit": 20
}
```
**Response:**
```json
{
  "mood": "Szczęśliwy",
  "track": {
    "id": "string",
    "name": "string",
    "artists": [...],
    "album": {...},
    "external_urls": {
      "spotify": "string"
    },
    "duration_ms": 0,
    "popularity": 0
  },
  "simple_info": {
    "name": "Tytuł piosenki",
    "artist": "Nazwa artysty",
    "spotify_url": "[https://open.spotify.com/track/](https://open.spotify.com/track/)...",
    "preview_url": "[https://p.scdn.co/mp3-preview/](https://p.scdn.co/mp3-preview/)..." or null,
    "image": "[https://i.scdn.co/image/](https://i.scdn.co/image/)..."
  }
}
```

**Errors:**
- `400` - Nieprawidłowy nastrój / Limit poza zakresem (1-50)
- `502` - Błąd połączenia ze Spotify
- `503` - Spotify nie skonfigurowany
