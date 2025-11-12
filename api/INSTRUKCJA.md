# Instrukcja uruchomienia Moodify API

## Wymagania wstępne
- Python 3.10 lub nowszy
- Dostęp do internetu w celu pobrania zależności

## Instalacja zależności
1. Otwórz terminal:
   - Windows: PowerShell lub Windows Terminal
   - macOS: Terminal
   - Linux: dowolny emulator terminala
2. Przejdź do katalogu projektu i wejdź do folderu `api` (dostosuj komendę do swojej lokalizacji repozytorium, np. `cd /ścieżka/do/moodify`):
   ```
   cd api
   ```
3. Utwórz i aktywuj wirtualne środowisko:
   - Windows:
     ```
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - macOS / Linux:
     ```
     python3 -m venv venv
     source venv/bin/activate
     ```
4. Utwórz plik `.env` i uzupełnij poświadczenia Spotify (patrz sekcja „Konfiguracja Spotify API”), np.:
   ```
   cat <<'EOF' > .env
   SPOTIFY_CLIENT_ID=twoj_client_id
   SPOTIFY_CLIENT_SECRET=twoj_client_secret
   # SPOTIFY_TOKEN_URL=https://accounts.spotify.com/api/token  (opcjonalnie)
   EOF
   ```
5. Zainstaluj zależności:
   ```
   pip install -r requirements.txt
   ```

## Uruchamianie serwera deweloperskiego
- Windows:
  ```
  uvicorn main:app --reload
  ```
- macOS / Linux:
  ```
  uvicorn main:app --reload
  ```
Po uruchomieniu interfejs dokumentacji FastAPI będzie dostępny pod adresem http://127.0.0.1:8000/docs.

## Dodawanie nowych funkcji
- Proste endpointy HTTP można dodawać bezpośrednio w pliku `main.py`.
- Dla bardziej rozbudowanej logiki warto tworzyć moduły w katalogu `api` (np. `routers/`, `services/`) i podłączać je w `main.py`.
- Serwer uruchomiony z opcją `--reload` automatycznie przeładuje aplikację po zmianach.

## Konfiguracja Spotify API (testowe tokeny)
1. Wejdź na https://developer.spotify.com/dashboard i zaloguj się na konto Spotify.
2. Utwórz nową aplikację („Create app”), po czym skopiuj `Client ID` i `Client Secret`.
3. W pliku `.env` ustaw wartości (adres tokenu możesz pominąć, jeśli korzystasz z domyślnego):
   ```
   SPOTIFY_CLIENT_ID=twoj_client_id
   SPOTIFY_CLIENT_SECRET=twoj_client_secret
   SPOTIFY_TOKEN_URL=https://accounts.spotify.com/api/token
   ```
4. Aby ręcznie pobrać token testowy (Client Credentials), możesz użyć:
   ```
   curl -X POST "https://accounts.spotify.com/api/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -u "CLIENT_ID:CLIENT_SECRET" \
     -d "grant_type=client_credentials"
   ```
   Otrzymany `access_token` jest ważny około 1 godzinę.
5. Backend FastAPI automatycznie użyje danych z `.env`. Poprawność integracji sprawdzisz, wywołując endpoint `/spotify/health` (np. przez `curl http://127.0.0.1:8000/spotify/health`); w odpowiedzi zobaczysz skróconą informację o pobranym tokenie.

## Wyłączanie środowiska
- Windows:
  ```
  deactivate
  ```
- macOS / Linux:
  ```
  deactivate
  ```

