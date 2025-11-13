import React from "react";
import { Music2, Timer, Volume2 } from "lucide-react";

interface RecommendationSummaryProps {
  mood: string;
  description: string;
  tracksCount: number;
  generated: string | null;
}

export const RecommendationsSummary: React.FC<RecommendationSummaryProps> = ({
  mood,
  description,
  tracksCount,
  generated,
}) => {
  const summary = description
    ? description.slice(0, 120) + (description.length > 120 ? "…" : "")
    : "Brak opisu — skorzystaj z analizy, aby poprawić trafność.";

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-white">
          Ostatnia analiza nastroju
        </h3>
        <p className="mt-2 text-sm text-white/70">{summary}</p>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <dt className="flex items-center gap-2 text-white/70">
            <Music2 className="h-4 w-4" /> Nastrój
          </dt>
          <dd className="mt-2 text-lg font-semibold text-white">{mood}</dd>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <dt className="flex items-center gap-2 text-white/70">
            <Volume2 className="h-4 w-4" /> Utworów
          </dt>
          <dd className="mt-2 text-lg font-semibold text-white">{tracksCount}</dd>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <dt className="flex items-center gap-2 text-white/70">
            <Timer className="h-4 w-4" /> Generowano
          </dt>
          <dd className="mt-2 text-lg font-semibold text-white">
            {generated ? generated : "nigdy"}
          </dd>
        </div>
      </dl>
    </div>
  );
};
