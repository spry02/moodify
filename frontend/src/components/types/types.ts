// Typy dla aplikacji Moodify

export interface Mood {
  id: string;
  mood: string;
  description: string;
  date: string;
  timestamp: number;
}

export type MoodType = 'Szczęśliwy' | 'Smutny' | 'Spokojny' | 'Energiczny' | 'Zaskoczony';
