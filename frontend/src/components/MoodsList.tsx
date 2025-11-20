import React, { useState, useEffect } from 'react';
import { Mood } from '../types';
import { mockGetMoodsApi, mockDeleteMoodApi } from '../api';

interface MoodsListProps {
  refreshTrigger: number;
}

export const MoodsList: React.FC<MoodsListProps> = ({ refreshTrigger }) => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoods = async () => {
    setIsLoading(true);
    try {
      const data = await mockGetMoodsApi();
      setMoods(data.sort((a: Mood, b: Mood) => b.timestamp - a.timestamp));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMoods();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    await mockDeleteMoodApi(id);
    loadMoods();
  };

  if (isLoading && moods.length === 0) {
    return <div className="text-center text-white/60">Ładowanie nastrojów...</div>;
  }

  if (moods.length === 0) {
    return (
      <div className="text-center text-white/60 py-8">
        Brak zapisanych nastrojów. Dodaj swój pierwszy nastrój!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {moods.map((mood) => (
        <div
          key={mood.id}
          className="rounded-2xl border border-white/20 bg-white/5 p-4 hover:bg-white/10 transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {mood.mood === 'Szczęśliwy' && '😊'}
                  {mood.mood === 'Smutny' && '😢'}
                  {mood.mood === 'Zestresowany' && '😰'}
                  {mood.mood === 'Spokojny' && '😌'}
                  {mood.mood === 'Zmęczony' && '😴'}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{mood.mood}</h3>
                  <p className="text-xs text-white/60">{mood.date}</p>
                </div>
              </div>
              {mood.description && (
                <p className="mt-2 text-sm text-white/80">{mood.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(mood.id)}
              className="ml-4 px-3 py-1 rounded text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 transition"
            >
              Usuń
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
