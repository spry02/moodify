import React, { useState } from 'react';
import { MoodType } from '../types';
import { mockAddMoodApi } from '../api';

const MOOD_OPTIONS: MoodType[] = ['Szczęśliwy', 'Smutny', 'Zestresowany', 'Spokojny', 'Zmęczony'];

interface AddMoodFormProps {
  onMoodAdded: () => void;
}

export const AddMoodForm: React.FC<AddMoodFormProps> = ({ onMoodAdded }) => {
  const [mood, setMood] = useState<MoodType>('Szczęśliwy');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const result = await mockAddMoodApi(mood, description, date);
      if (result.status === 'success') {
        setSuccessMessage(`✅ Dodano nastrój: ${mood} (${date})`);
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setMood('Szczęśliwy');
        onMoodAdded();
        
        // Ukryj wiadomość po 3 sekundach
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage('❌ Błąd przy dodawaniu nastroju');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nastrój */}
      <div>
        <label className="block text-sm font-medium mb-2">Nastrój</label>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value as MoodType)}
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15 focus:outline-none focus:border-white/40 transition"
          disabled={isLoading}
        >
          {MOOD_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Opis */}
      <div>
        <label className="block text-sm font-medium mb-2">Opis nastroju</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opisz swój nastrój..."
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 hover:bg-white/15 focus:outline-none focus:border-white/40 transition resize-none"
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Data */}
      <div>
        <label className="block text-sm font-medium mb-2">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15 focus:outline-none focus:border-white/40 transition"
          disabled={isLoading}
        />
      </div>

      {/* Przycisk */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-green-700 disabled:opacity-50 text-white font-semibold transition"
      >
        {isLoading ? 'Dodawanie...' : 'Dodaj nastrój'}
      </button>

      {/* Wiadomości */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/40 text-green-200 text-sm">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm">
          {errorMessage}
        </div>
      )}
    </form>
  );
};
