# Frontend Moodify - Dokumentacja

## Quick Start

```bash
# Instalacja zależności
cd frontend
npm install

# Uruchomienie w trybie development (http://localhost:5173)
npm run dev

# Build do produkcji
npm run build

# Preview built version
npm run preview
```

## Tech Stack

- **React** 18.3.1 - Biblioteka UI
- **TypeScript** 5.6.2 - Typowanie statyczne
- **Vite** 5.4.1 - Szybki bundler
- **Tailwind CSS** 3.4.13 - Utility-first CSS
- **Firebase** 12.6.0 - Autentykacja i baza danych
- **Axios** 1.13.2 - HTTP client
- **Lucide React** 0.553.0 - Ikony

## Struktura projektu

```
frontend/src/
├── components/
│   ├── Auth/              # Autentykacja (login, register, profil)
│   ├── api/               # Integracja z backendem
│   ├── firebase/          # Konfiguracja Firebase
│   ├── types/             # Typy TypeScript
│   ├── MainDashboard.tsx  # Główny komponent
│   ├── CameraBox.tsx      # Wgrywanie zdjęć
│   ├── AddMoodForm.tsx    # Dodawanie nastroju
│   ├── MoodSelectPanel.tsx# Wybór nastroju
│   ├── SongsList.tsx      # Lista piosenek
│   ├── HistoryList.tsx    # Lista historii
│   ├── LoginPanel.tsx     # Panel logowania
│   └── ...inne komponenty
├── App.tsx                # Routing i logika auth
├── main.tsx               # Punkt wejścia
└── index.css              # Style globalne
```

## Główne funkcjonalności

### MainDashboard
Centralna część aplikacji zawiera:
- Zarządzanie nastroje
- Wgrywanie zdjęć do analizy emocji
- Wyświetlanie rekomendacji muzycznych
- Przełączanie motywu (dark/light)

### Komponenty
- **Auth** - Logowanie, rejestracja, profil użytkownika
- **CameraBox** - Upload i podgląd zdjęć
- **MoodsList** - Historia nastrojów użytkownika
- **SongsList** - Lista piosenek ze Spotify
- **HistoryList** - Historia rekomendacji
- **AnalysisResult** - Wynik analizy emocji z AI
- **Recommendations** - Rekomendacje muzyczne

## Autentykacja

- Firebase Authentication (email/hasło)
- Warunkowe renderowanie UI na podstawie stanu logowania
- Persystencja tokena użytkownika

## Konfiguracja API

Vite proxy automatycznie mapuje:
```
/api/* → http://localhost:8000
```

**Wymagane requesty do backendu:**
- `POST /api/history/items/` - Pobieranie historii
- `POST /api/image/mood/song/` - Analiza emocji z zdjęcia
- `POST /api/mood/song/` - Predykcja emocji z tekstu / opis nastroju
- `GET /api/spotify/*` - Integracja Spotify

## Stylowanie

- **Tailwind CSS** - Utility-first framework
- **Dark Mode** - Obsługiwany w całej aplikacji
- **Theme Storage** - Motyw zapisywany w `localStorage`
- **Responsywny design** - Mobile-first approach

Gradienty tła (do edycji w `MainDashboard.tsx`):
```typescript
const gradient = "bg-[radial-gradient(...)]"      // Ciemny motyw
const lightGradient = "bg-[radial-gradient(...)]" // Jasny motyw
```

## Typy TypeScript

### Mood
```typescript
interface Mood {
  id: string
  mood: MoodType
  description: string
  date: string
  timestamp: number
}

type MoodType = 'Szczęśliwy' | 'Smutny' | 'Spokojny' | 'Energiczny' | 'Zaskoczony'

interface SongItem {
  artist: string;
  image: string;
  name: string;
  spotify_id: string;
  spotify_url: string;
  duration_ms: number;
}
```

### Integracja Spotify
```typescript
interface TrackItem {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  url: string;
}

interface HistoryItem {
  id: string;
  title: string;
  artist: string;
  date: string;
  url: string;
}
```

## Konfiguracja Firebase

W pliku `components/firebase/firebase.ts` dodaj swoje dane:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

## Deployment

### Build
```bash
npm run build
```
Tworzy folder `dist/` gotowy do wdrożenia.

### Wymogi backendu
- Backend musi być dostępny pod `http://localhost:8000` (lub zmienić w `vite.config.ts`)
- CORS musi być skonfigurowany aby zezwalać na `localhost:5173`

## Stan aplikacji w MainDashboard

```typescript
theme: "dark" | "light"
selectedModule: "description" | "camera" | "mood" | null
description: string
selectedMood: MoodType
tracks: TrackItem[]
history: HistoryItem[]
photoPreview: string | null
detectedEmotion: string | null
isGenerating: boolean
```

## Developmentowe

- Hot Reload włączony (Vite HMR)
- TypeScript Strict Mode aktywny
- Brak mock API - wymagany działający backend
- Firefox DevTools rekomendowany do debugowania

## Skrypty dostępne

```bash
npm run dev     # Uruchomienie dev serwera
npm run build   # Build do produkcji
npm run preview # Preview producyjnej wersji
```

## Powiązane pliki

- [Pełna dokumentacja](./frontend_dokumentacja.md)

## Wymagania przed startem

1. Node.js 18+
2. Backend API uruchomiony na porcie 8000
3. Firebase project skonfigurowany
4. Spotify API credentials (opcjonalnie)

## Przydatne tipy

1. **LocalStorage** - Motyw jest zapisywany (`moodify-theme`)
2. **Auth State** - Monitorowany w `App.tsx` przez Firebase
3. **API Token** - Automatycznie dołączany z `auth.currentUser.getIdToken()`
4. **Gradients** - Zmienia się w zależności od motywu w `MainDashboard`

---

**Autor:** Zespół Moodify  
**Ostatnia aktualizacja:** 2026-01-21
