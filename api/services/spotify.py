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

    @classmethod
    def from_env(cls) -> "SpotifyConfig":
        return cls(
            client_id=os.getenv("SPOTIFY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
            token_url=os.getenv(
                "SPOTIFY_TOKEN_URL", "https://accounts.spotify.com/api/token"
            ),
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

        auth_header = base64.b64encode(
            f"{self.config.client_id}:{self.config.client_secret}".encode("utf-8")
        ).decode("utf-8")

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                self.config.token_url,
                headers={
                    "Authorization": f"Basic {auth_header}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={"grant_type": "client_credentials"},
            )

        if response.status_code != httpx.codes.OK:
            raise SpotifyAPIError(
                f"Nie udało się uzyskać tokenu Spotify ({response.status_code}): {response.text}"
            )

        token_data = response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise SpotifyAPIError("Brak tokenu w odpowiedzi Spotify.")
        self._access_token = access_token
        self._token_metadata = {
            "token_type": token_data.get("token_type"),
            "expires_in": token_data.get("expires_in"),
            "scope": token_data.get("scope"),
        }
        return access_token

    async def _get_access_token(self) -> str:
        if self._access_token:
            return self._access_token
        return await self._request_access_token()

    def _build_token_summary(self) -> dict[str, Any]:
        if not self._access_token:
            return {}
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
        if refresh or not self._access_token:
            await self._request_access_token()
        else:
            await self._get_access_token()
        return self._build_token_summary()

