from __future__ import annotations

import base64
import os
from dataclasses import dataclass
from typing import Any

import httpx


class SpotifyNotConfiguredError(RuntimeError):
    """Rzucane, gdy brakuje wymaganych poświadczeń dla Spotify."""


class SpotifyAPIError(RuntimeError):
    """Rzucane, gdy odpowiedź z API Spotify jest nieprawidłowa."""


@dataclass(frozen=True)
class SpotifyConfig:
    client_id: str | None
    client_secret: str | None
    token_url: str
    api_base_url: str

    @classmethod
    def from_env(cls) -> "SpotifyConfig":
        return cls(
            client_id=os.getenv("SPOTIFY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
            token_url=os.getenv("SPOTIFY_TOKEN_URL", "https://accounts.spotify.com/api/token"),
            api_base_url=os.getenv("SPOTIFY_API_BASE_URL", "https://api.spotify.com/v1"),
        )

    def is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret)


class SpotifyAPI:
    def __init__(self, config: SpotifyConfig):
        self.config = config
        self._access_token: str | None = None
        self._token_metadata: dict[str, Any] | None = None

    async def _request_access_token(self) -> str:
        if not self.config.is_configured():
            raise SpotifyNotConfiguredError(
                "Ustaw zmienne środowiskowe SPOTIFY_CLIENT_ID i SPOTIFY_CLIENT_SECRET."
            )

        auth_string = f"{self.config.client_id}:{self.config.client_secret}"
        auth_bytes = auth_string.encode("utf-8")
        auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    self.config.token_url,
                    headers={
                        "Authorization": f"Basic {auth_base64}",
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    data={"grant_type": "client_credentials"},
                )
            except httpx.RequestError as e:
                raise SpotifyAPIError(f"Błąd połączenia (Token): {e}")

        if response.status_code != 200:
            raise SpotifyAPIError(
                f"Nie udało się uzyskać tokenu Spotify ({response.status_code}): {response.text}"
            )

        token_data = response.json()
        self._access_token = token_data.get("access_token")
        
        if not self._access_token:
            raise SpotifyAPIError("Brak tokenu w odpowiedzi Spotify.")
            
        self._token_metadata = {
            "token_type": token_data.get("token_type"),
            "expires_in": token_data.get("expires_in"),
            "scope": token_data.get("scope"),
        }
        return self._access_token

    async def _get_access_token(self) -> str:
        if self._access_token:
            return self._access_token
        return await self._request_access_token()

    def _build_token_summary(self) -> dict[str, Any]:
        """Tworzy podsumowanie stanu tokenu dla endpointu health check."""
        if not self._access_token:
            return {"status": "missing"}
        
        preview = (
            f"{self._access_token[:8]}..." if len(self._access_token) > 8 else self._access_token
        )
        metadata = {"access_token_preview": preview}
        if self._token_metadata:
            metadata.update(
                {key: value for key, value in self._token_metadata.items() if value is not None}
            )
        return metadata

    async def token_status(self, refresh: bool = False) -> dict[str, Any]:
        """Metoda wywoływana przez routes/spotify.py -> health check."""
        if refresh or not self._access_token:
            await self._request_access_token()
        elif not self._access_token:
             await self._get_access_token()
             
        return self._build_token_summary()

    async def _make_api_request(self, method: str, endpoint: str, **kwargs) -> dict[str, Any]:
        token = await self._get_access_token()
        
        base = self.config.api_base_url.rstrip("/")
        path = endpoint.lstrip("/")
        url = f"{base}/{path}"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.request(
                    method,
                    url,
                    headers={"Authorization": f"Bearer {token}"},
                    **kwargs
                )
            except httpx.RequestError as e:
                raise SpotifyAPIError(f"Błąd połączenia z API: {e}")

            if response.status_code != 200:
                print(f"DEBUG ERR BODY: {response.text}")
                raise SpotifyAPIError(
                    f"Błąd API Spotify ({response.status_code}) dla URL: {url}"
                )
            return response.json()

    async def search_tracks(self, query: str, limit: int = 20) -> dict[str, Any]:
        """
        Wyszukuje utwory pasujące do zapytania (zastępuje get_recommendations).
        """
        params = {
            "q": query,
            "type": "track",
            "limit": limit,
            "market": "PL" 
        }
        return await self._make_api_request("GET", "search", params=params)