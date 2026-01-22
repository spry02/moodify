# Dokumentacja Frontend - Moodify

## Spis treści
1. [Przegląd projektu](#przegląd-projektu)
2. [Architektura i struktura](#architektura-i-struktura)
3. [Konfiguracja](#konfiguracja)
4. [Komponenty](#komponenty)
5. [API](#api)
6. [Autentykacja](#autentykacja)
7. [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
8. [Stylowanie](#stylowanie)

---

## Przegląd projektu

**Moodify** to aplikacja internetowa do analizy nastrojów i rekomendacji muzycznych na podstawie:
- Opisów emocji użytkownika
- Zdjęć (analiza wyrażeń twarzy)
- Bezpośredniego wyboru nastroju

Aplikacja integruje się z:
- **Firebase** - autentykacja i baza danych
- **Spotify API** - pobieranie i tworzenie list odtwarzania
- **Backend API** - predykcje modeli ML (analiza emocji)

**Stack technologiczny:**
- React 18.3.1
- TypeScript 5.6.2
- Vite 5.4.1 (bundler)
- Tailwind CSS 3.4.13
- Firebase 12.6.0
- Axios 1.13.2
- Lucide React 0.553.0 (ikony)

---

## Architektura i struktura

### Struktura katalogów

```
frontend/
├── src/
│   ├── components/              # Komponenty React
│   │   ├── Auth/               # Komponenty autentykacji
│   │   │   ├── Auth.css
│   │   │   ├── AuthPopup.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ProfileModal.tsx
│   │   │   └── UserPanel.tsx
│   │   ├── api/                # Integracja z API
│   │   │   └── api.ts
│   │   ├── firebase/           # Konfiguracja Firebase
│   │   │   └── firebase.ts
│   │   ├── types/              # Typy TypeScript
│   │   │   └── types.ts
│   │   ├── assets/             # Zasoby statyczne (logo, obrazy)
│   │   ├── AddMoodForm.tsx      # Formularz dodawania nastroju
│   │   ├── AnalysisResult.tsx   # Wynik analizy emocji
│   │   ├── CameraBox.tsx        # Interfejs kamery
│   │   ├── Card.tsx             # Komponenta karty
│   │   ├── ControlToggles.tsx   # Przyciski przełączników
│   │   ├── DescriptionBox.tsx   # Pole opisu
│   │   ├── GenerateButton.tsx   # Przycisk generowania
│   │   ├── HistoryList.tsx      # Lista historii
│   │   ├── LoginPanel.tsx       # Panel logowania
│   │   ├── MainDashboard.tsx    # Główny komponent dashboardu
│   │   ├── MoodSelectPanel.tsx  # Panel wyboru nastroju
│   │   ├── MoodsList.tsx        # Lista nastrojów
│   │   ├── Recommendations.tsx  # Rekomendacje
│   │   ├── SongsList.tsx        # Lista piosenek
│   │   ├── ThemeToggle.tsx      # Przełącznik motywu
│   │   ├── UserPanel.tsx        # Panel użytkownika
│   │   └── vite-end.d.ts        # Deklaracje typów Vite
│   ├── App.tsx                  # Główny komponent (routing)
│   ├── main.tsx                 # Punkt wejścia
│   └── index.css                # Style globalne
├── public/                      # Zasoby publiczne
├── vite.config.ts               # Konfiguracja Vite
├── tsconfig.json                # Konfiguracja TypeScript
├── tailwind.config.js           # Konfiguracja Tailwind CSS
├── postcss.config.js            # Konfiguracja PostCSS
└── package.json                 # Zależności projektu
```

---

## Konfiguracja

### Vite Configuration (`vite.config.ts`)

```typescript
- port: 5173
- host: true (dostępne z zewnątrz)
- proxy API: "/api" → "http://localhost:8000"
```

### TypeScript (`tsconfig.json`)

- **Target:** ES2020
- **Module:** ESNext
- **JSX:** react-jsx
- **Strict mode:** enabled
- **Module resolution:** Bundler

### Tailwind CSS

Stylowanie oparte na utility-first framework:
- Niestandardowe gradienty dla ciemnego i jasnego motywu
- Responsywny design
- Dark mode support
- Autoprefixer dla kompatybilności przeglądarek

---

## Komponenty

### Główny punkt wejścia: `App.tsx`

**Funkcjonalność:**
- Zarządzanie stanem autentykacji
- Wyświetlanie loading state
- Warunkowe renderowanie: `MainDashboard` (zalogowany) lub `AuthPopup` (niezalogowany)

**Stan:**
```typescript
const [user, setUser] = useState<User | null>(null)
const [loading, setLoading] = useState(true)
```

**Funkcjonalność:**
- Monitoruje `onAuthStateChanged` z Firebase
- Wyświetla loading screen do czasu załadowania stanu
- Renderuje odpowiedni komponenty na podstawie stanu autentykacji

---

### Dashboard: `MainDashboard.tsx`

**Główny komponent aplikacji - centralna część interfejsu (443 linie)**

**State:**
```typescript
theme: "dark" | "light"                    // Motyw
selectedModule: "description" | "camera" | "mood" | null  // Wybrany moduł
description: string                       // Opis nastroju
selectedMood: MoodType                     // Wybrany nastrój (enum)
analysisMood: MoodType | null              // Nastrój z analizy AI
analysisSourceLabel: string | null         // Źródło analizy
tracks: TrackItem[]                        // Lista piosenek ze Spotify
playlists: PlaylistItem[]                  // Lista list odtwarzania
photoPreview: string | null                // Podgląd zdjęcia (base64)
photoFileName: string | null               // Nazwa pliku zdjęcia
photoFile: File | null                     // Plik zdjęcia
detectedEmotion: string | null             // Wykryta emocja z modelu
isGenerating: boolean                      // Flaga generowania
generatedAt: string | null                 // Czas generowania
```

**Główne funkcje:**
- `handlePhotoUpload(file)` - przesyła zdjęcie i wysyła do API
- `getTracksfromDB()` - pobiera piosenki z historii backendu
- `toggleTheme()` - przełącza między ciemnym a jasnym motywem
- Zarządzanie stanem UI dla modułów (kamera, opis, nastrój)

**Stałe:**
```typescript
gradient = "bg-[radial-gradient(...)]"     // Gradient ciemny
lightGradient = "bg-[radial-gradient(...)]"// Gradient jasny
MODULE_LABELS = { description, camera, mood } // Etykiety
THEME_STORAGE_KEY = "moodify-theme"        // Klucz localStorage
```

---

### Komponenty formularzy

#### `AddMoodForm.tsx`
Formularz do dodawania nowego nastroju
- Pole na opis
- Selektor daty
- Przycisk wysyłki

#### `MoodSelectPanel.tsx`
Panel do wyboru typu nastroju
- Dostępne nastroje:
  - Szczęśliwy
  - Smutny
  - Spokojny
  - Energiczny
  - Zaskoczony
- Wizualny interfejs wyboru

#### `DescriptionBox.tsx`
Pole tekstowe do wpisania opisu nastroju
- Textarea z placeholder
- Walidacja

#### `CameraBox.tsx`
Interfejs do:
- Wgrywania zdjęcia z urządzenia (file input)
- Podglądu zdjęcia przed wysyłką
- Wysyłki do API do analizy emocji (computer vision)

---

### Komponenty danych i wyników

#### `SongsList.tsx`
Wyświetla listę piosenek ze Spotify

```typescript
export interface TrackItem {
  id: string
  name: string
  artists: Artist[]
  album: Album
  preview_url?: string
}
```

#### `PlaylistsList.tsx`
Wyświetla listę list odtwarzania

```typescript
export interface PlaylistItem {
  id: string
  name: string
  description?: string
  images: Image[]
  external_urls: ExternalUrls
}
```

#### `MoodsList.tsx`
Wyświetla historię nastrojów użytkownika
- Pobiera dane z API `/api/history/items/`
- Pozwala na usunięcie wpisów
- Odświeża się automatycznie
- Wyświetla datę i godzinę w formacie PL

#### `Recommendations.tsx` / `RecommendationsSummary.tsx`
Wyświetla streszczenie rekomendacji muzycznych
- Na podstawie analizy nastroju
- Ilość piosenek
- Ilość playlist

#### `AnalysisResult.tsx`
Pokazuje rezultaty analizy zdjęcia:
- Wykryta emocja
- Poziom pewności/confidence
- Rekomendacje na podstawie emocji

---

### Komponenty UI i nawigacji

#### `Card.tsx`
Komponent karty - uniwersalny element UI do grupowania zawartości
- Wrapper z stylami
- Obsługuje children

#### `ControlToggles.tsx`
Przyciski do przełączania między modułami

```typescript
type ToggleKey = "description" | "camera" | "mood" | null
```

- 3 główne moduły
- Aktualny stan wyróżniony

#### `GenerateButton.tsx`
Przycisk do uruchomienia generowania rekomendacji
- Wysyła żądanie do API
- Pokazuje loading state
- Obsługuje błędy

#### `ThemeToggle.tsx`
Przycisk do przełączania między motywem jasnym a ciemnym

```typescript
type Theme = "dark" | "light"

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}
```

---

### Komponenty autentykacji: `Auth/`

#### `AuthPopup.tsx`
Modal wyświetlany niezalogowanym użytkownikom
- Zawiera formularze logowania i rejestracji
- Przełączanie między formami

#### `LoginForm.tsx`
Formularz logowania
- Email i hasło
- Walidacja
- Przycisk logowania
- Link do rejestracji

#### `RegisterForm.tsx`
Formularz rejestracji
- Email, hasło, potwierdzenie hasła
- Walidacja (hasła muszą się zgadzać)
- Przycisk rejestracji

#### `ProfileModal.tsx`
Modal profilu zalogowanego użytkownika
- Dane profilu (email)
- Opcje wylogowania
- Zamykanie modalu

#### `UserPanel.tsx`
Panel użytkownika w dashboardzie

```typescript
interface UserPanelProps {
  user: User | null
}
```

- Pokazuje dane bieżącego użytkownika
- Przycisk otwierający profil
- Przycisk wylogowania

---

## API

### Plik: `components/api/api.ts`

Zawiera funkcje do komunikacji z backendem:

#### Mock API (do testowania bez backendu)
```typescript
mockAddMoodApi(mood: MoodType, description: string, date: string)
  → Promise<{ status: 'success' | 'error', data?: Mood, message?: string }>

mockGetMoodsApi()
  → Promise<Mood[]>

mockDeleteMoodApi(id: string)
  → Promise<{ status: 'success' | 'error' }>
```

#### API Backend (rzeczywiste)
Żądania HTTP do:
- `POST /api/history/items/` - pobieranie historii nastrojów
- `POST /api/predict` - wysyłanie zdjęcia do analizy emocji
- `GET /api/spotify/*` - integracja ze Spotify
- `POST /api/mood/*` - zarządzanie nastrojami (create, delete)
- `GET /api/health` - sprawdzenie zdrowotności API

**Proxy konfiguracja (Vite):**
```
/api → http://localhost:8000
```

---

## Autentykacja

### Konfiguracja Firebase: `components/firebase/firebase.ts`

**Obsługiwane metody:**
- Email/hasło (primaryEmail authentication)
- Potencjalnie OAuth (Google, Facebook - do implementacji)

**Funkcjonalność:**
- Tworzenie nowych kont (`createUserWithEmailAndPassword`)
- Logowanie (`signInWithEmailAndPassword`)
- Wylogowanie (`signOut`)
- Resetowanie hasła
- Pobieranie ID tokena do żądań API
- Pobieranie danych użytkownika (`auth.currentUser`)

**Integracja:**
- `App.tsx` monitoruje zmiany stanu autentykacji przez `onAuthStateChanged`
- Komponenty Auth obsługują formularze
- UserPanel wyświetla dane zalogowanego użytkownika
- Token pobierany w żądaniach API: `auth.currentUser.getIdToken()`

---

## Typy TypeScript

### `components/types/types.ts`

```typescript
export interface Mood {
  id: string
  mood: MoodType              // Typ nastroju
  description: string         // Opis nastroju
  date: string               // Data
  timestamp: number          // Unix timestamp
}

export type MoodType = 
  | 'Szczęśliwy' 
  | 'Smutny' 
  | 'Spokojny' 
  | 'Energiczny' 
  | 'Zaskoczony'
```

### Interfejsy komponentów

```typescript
interface TrackItem {
  id: string
  name: string
  artists: Artist[]
  album: Album
}

interface PlaylistItem {
  id: string
  name: string
  description?: string
  images: Image[]
}

interface UserPanelProps {
  user: User | null
}

interface ThemeToggleProps {
  theme: "dark" | "light"
  onToggle: () => void
}
```

---

## Instalacja i uruchomienie

### Wymagania
- Node.js 18+
- npm lub yarn
- Backend API uruchomiony na `http://localhost:8000`

### Instalacja zależności
```bash
cd frontend
npm install
```

### Uruchomienie w trybie development
```bash
npm run dev
```
- Aplikacja będzie dostępna na: `http://localhost:5173`
- Hot reload włączony
- Proxy do API skonfigurowany

### Build do produkcji
```bash
npm run build
```
- Skompiluje TypeScript (`tsc -b`)
- Zoptymalizuje z Vite
- Wyjście w katalogu `dist/`
- Gotowe do deploymentu

### Preview built version
```bash
npm run preview
```
- Uruchamia built version lokalnie

---

## Stylowanie

### Framework: Tailwind CSS

**Główne cechy:**
- Utility-first CSS framework
- Responsive design (mobile-first)
- Dark mode support
- PostCSS dla autoprefixowania

### Zmienne tematu: `MainDashboard.tsx`

```typescript
const gradient = "bg-[radial-gradient(1300px_700px_at_5%_35%,...)]"
const lightGradient = "bg-[radial-gradient(1200px_600px_at_80%_-10%,...)]"
```

Gradienty definiują tło aplikacji dla różnych motywów.

### Struktura CSS

- `index.css` - style globalne i setup Tailwind
- `Auth/Auth.css` - style dla komponentów autentykacji
- Komponenty mają inline Tailwind classes
- Brak oddzielnych SCSS/LESS plików

### System kolorów

- **Ciemny motyw (domyślny)**:
  - Tła: czarne i ciemnoszare (#05090f, #020308)
  - Akcenty: zielone (emerald) i fioletowe (indigo)
  - Tekst: biały

- **Jasny motyw**:
  - Tła: białe i jasne szare (rgba(148,163,184,0.35), white)
  - Akcenty: fioletowe i zielone
  - Tekst: ciemny szary

### LocalStorage

- Motyw zapisywany w `localStorage` z kluczem `moodify-theme`
- Persystuje na pomiędzy sesjami

---

## Przepływ danych

```
App.tsx
  ↓
  [Firebase Auth Check]
  ↓
  ├─→ AuthPopup (niezalogowany)
  │    ├─→ LoginForm
  │    └─→ RegisterForm
  │
  └─→ MainDashboard (zalogowany)
       ├─→ UserPanel
       ├─→ ThemeToggle
       ├─→ ControlToggles (wybór modułu)
       │    ├─→ DescriptionBox + AddMoodForm
       │    ├─→ CameraBox (upload zdjęcia)
       │    └─→ MoodSelectPanel
       ├─→ GenerateButton (API /predict)
       │    ↓
       │    AnalysisResult
       ├─→ MoodsList (API /history/items/)
       ├─→ SongsList
       ├─→ PlaylistsList
       └─→ Recommendations
```

---

## Zmienne środowiska

Konfiguracja Firebase powinna być w `components/firebase/firebase.ts`

**Wymagane stałe Firebase:**
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

---

## Notatki dla deweloperów

1. **TypeScript Strict Mode** - wszystkie typy muszą być wyraźnie zdefiniowane
2. **React Hooks** - komponenty używają `useState`, `useEffect`, nie ma komponentów klasowych
3. **Firebase Auth** - bieżący użytkownik dostępny przez `auth.currentUser`
4. **API Proxy** - żądania do `/api/*` są automatycznie routowane do backendu (Vite)
5. **Theme Persistence** - motyw zapisywany w `localStorage` z kluczem `moodify-theme`
6. **Hot Reload** - Vite zapewnia HMR dla szybkiego developmentu
7. **CORS** - backend musi pozwolić na żądania z `localhost:5173`

## Ścieżka weryfikacji

Aby sprawdzić czy aplikacja działa:

1. Uruchom backend: `python api/main.py`
2. Uruchom frontend: `npm run dev`
3. Przejdź do `http://localhost:5173`
4. Zaloguj się lub utwórz konto
5. Spróbuj:
   - Dodać nastrój przez opis
   - Wgrać zdjęcie do analizy
   - Wybrać nastrój z panelu
   - Generować rekomendacje
   - Przełączyć motyw

---
