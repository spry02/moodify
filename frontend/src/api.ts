// Mock API - symulacja backendu
import { Mood, MoodType } from './types';

// Mock baza danych
let MOCK_MOODS_DB: Mood[] = [];

export const mockAddMoodApi = async (
  mood: MoodType,
  description: string,
  date: string
): Promise<{ status: 'success' | 'error'; data?: Mood; message?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMood: Mood = {
        id: `mood_${Date.now()}`,
        mood,
        description,
        date,
        timestamp: Date.now(),
      };
      MOCK_MOODS_DB.push(newMood);
      resolve({ status: 'success', data: newMood });
    }, 500); // Symulacja opóźnienia sieciowego
  });
};

export const mockGetMoodsApi = async (): Promise<Mood[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_MOODS_DB]);
    }, 300);
  });
};

export const mockDeleteMoodApi = async (id: string): Promise<{ status: 'success' | 'error' }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      MOCK_MOODS_DB = MOCK_MOODS_DB.filter((m) => m.id !== id);
      resolve({ status: 'success' });
    }, 300);
  });
};
