// Typy dla aplikacji Moodify

export interface Mood {
  id: string;
  mood: string;
  description: string;
  date: string;
  timestamp: number;
}

export type MoodType = 'Szczęśliwy' | 'Smutny' | 'Spokojny' | 'Energiczny' | 'Zaskoczony';

export interface SongItem {
  artist: string;
  image: string;
  name: string;
  spotify_id: string;
  spotify_url: string;
  duration_ms: number;
}
