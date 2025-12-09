from functools import lru_cache
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from services.spotify import (
    SpotifyAPI,
    SpotifyAPIError,
    SpotifyConfig,
    SpotifyNotConfiguredError,
)

router = APIRouter(prefix="/spotify", tags=["spotify"])


@lru_cache
def get_spotify_api() -> SpotifyAPI:
    return SpotifyAPI(SpotifyConfig.from_env())


@router.get("/health", summary="Sprawdzenie połączenia ze Spotify API")
async def spotify_health_check(
    spotify_api: SpotifyAPI = Depends(get_spotify_api),
) -> dict[str, Any]:
    try:
        details = await spotify_api.token_status(refresh=True)
        return {"status": "ok", "details": details}
    except SpotifyNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Skonfiguruj zmienne środowiskowe SPOTIFY_CLIENT_ID oraz "
                "SPOTIFY_CLIENT_SECRET, aby korzystać z integracji Spotify."
            ),
        )
    except SpotifyAPIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

