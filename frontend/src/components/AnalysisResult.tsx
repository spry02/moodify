import React from "react";
import { Brain, Music, Sparkles } from "lucide-react";
import { MoodType } from "./types/types";

interface AnalysisResultProps {
  detectedEmotion?: string | null;
  assignedMood: MoodType;
  songTitle: string;
  songArtist: string;
  sourceLabel?: string;
}

const EMOTION_EMOJI: Record<string, string> = {
  "Szczęście": "😊",
  "Smutek": "😢",
  "Strach": "😨",
  "Złość": "😠",
  "Zaskoczenie": "😲",
};

const MOOD_EMOJI: Record<MoodType, string> = {
  "Szczęśliwy": "🎉",
  "Smutny": "💙",
  "Spokojny": "🧘",
  "Energiczny": "⚡",
  "Zaskoczony": "✨",
};

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  detectedEmotion,
  assignedMood,
  songTitle,
  songArtist,
  sourceLabel,
}) => {
  const emotionAvailable = Boolean(detectedEmotion);
  const resolvedSourceLabel = sourceLabel ? sourceLabel : "Analiza";

  return (
    <div className="rounded-3xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent p-6 shadow-lg backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-emerald-400/20 p-2">
          <Sparkles className="h-6 w-6 text-emerald-300" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          🎯 Wynik Analizy
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Wykryta Emocja / Źródło */}
        <div className="rounded-2xl border border-emerald-400/30 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-emerald-300 mb-3">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-semibold">
              {emotionAvailable ? "Wykryta Emocja" : "Źródło analizy"}
            </span>
          </div>
          <div className="text-center">
            {emotionAvailable ? (
              <>
                <div className="text-5xl mb-2">
                  {EMOTION_EMOJI[String(detectedEmotion)] || "🤔"}
                </div>
                <p className="text-2xl font-bold text-white">{detectedEmotion}</p>
                <p className="text-xs text-white/60 mt-1">{resolvedSourceLabel}</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-2">📝</div>
                <p className="text-xl font-bold text-white">
                  {resolvedSourceLabel}
                </p>
                <p className="text-xs text-white/60 mt-1">bez wykrytej emocji</p>
              </>
            )}
          </div>
        </div>

        {/* Przypisany Nastrój */}
        <div className="rounded-2xl border border-purple-400/30 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-purple-300 mb-3">
            <Music className="h-5 w-5" />
            <span className="text-sm font-semibold">Przypisany Nastrój</span>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-2">{MOOD_EMOJI[assignedMood] || "🎵"}</div>
            <p className="text-2xl font-bold text-white">{assignedMood}</p>
            <p className="text-xs text-white/60 mt-1">do rekomendacji</p>
          </div>
        </div>

        {/* Polecony Utwór */}
        <div className="rounded-2xl border border-blue-400/30 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-blue-300 mb-3">
            <Music className="h-5 w-5" />
            <span className="text-sm font-semibold">Polecony Utwór</span>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🎵</div>
            <p className="text-lg font-bold text-white line-clamp-1">{songTitle}</p>
            <p className="text-sm text-white/70 line-clamp-1">{songArtist}</p>
            <p className="text-xs text-white/60 mt-1">dopasowany do nastroju</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-emerald-400/10 px-4 py-3 text-center">
        <p className="text-sm text-emerald-200">
          ✅ Analiza zakończona pomyślnie! Scroll w dół, aby zobaczyć więcej szczegółów.
        </p>
      </div>
    </div>
  );
};
