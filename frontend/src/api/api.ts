import axios, { AxiosInstance, AxiosError } from 'axios';

// Konfiguracja instancji axios z bazowym URL
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Typy dla odpowiedzi API
export interface ApiResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
}

export interface RootResponse {
  message: string;
}

export interface SpotifyHealthResponse {
  status: string;
  details: any;
}

export interface MoodSongRequest {
  mood: string;
}

export interface Song {
  title: string;
  artist: string;
  spotify_id: string;
}

export interface MoodSongResponse {
  mood: string;
  song: Song;
}

// Funkcje API

/**
 * Testowy endpoint - sprawdza czy API działa
 */
export const testApi = async (): Promise<RootResponse> => {
  try {
    const response = await apiClient.get<RootResponse>('/');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(
      `Błąd połączenia z API: ${axiosError.message}`
    );
  }
};

/**
 * Sprawdza połączenie ze Spotify API
 */
export const checkSpotifyHealth = async (): Promise<SpotifyHealthResponse> => {
  try {
    const response = await apiClient.get<SpotifyHealthResponse>('/spotify/health');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      // API zwróciło błąd
      throw new Error(
        `Błąd Spotify API: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`
      );
    }
    throw new Error(
      `Błąd połączenia z API: ${axiosError.message}`
    );
  }
};

/**
 * Pobiera utwór na podstawie nastroju
 * @param mood - nastrój: 'Szczęśliwy', 'Smutny', 'Zestresowany', 'Spokojny', 'Zmęczony'
 */
export const getMoodSong = async (
  mood: string
): Promise<MoodSongResponse> => {
  try {
    const response = await apiClient.post<MoodSongResponse>(
      '/api/mood/song/',
      { mood }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      // API zwróciło błąd
      const errorDetail = axiosError.response.data as { detail?: string };
      throw new Error(
        `Błąd pobierania utworu: ${errorDetail.detail || axiosError.response.statusText}`
      );
    }
    throw new Error(
      `Błąd połączenia z API: ${axiosError.message}`
    );
  }
};

// Eksport instancji axios na wypadek potrzeby bezpośredniego użycia
export default apiClient;

