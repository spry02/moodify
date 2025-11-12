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
4. Zainstaluj zależności:
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

## Wyłączanie środowiska
- Windows:
  ```
  deactivate
  ```
- macOS / Linux:
  ```
  deactivate
  ```

