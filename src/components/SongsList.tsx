import React from "react";

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
}

interface SongsListProps {
  tracks: TrackItem[];
}

export const SongsList: React.FC<SongsListProps> = ({ tracks }) => {
  if (!tracks.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/60">
        Brak propozycji. Wygeneruj rekomendacje, aby zobaczyć listę utworów.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tracks.map((track, index) => {
        const minutes = Math.floor(track.durationMs / 60000);
        const seconds = Math.round((track.durationMs % 60000) / 1000)
          .toString()
          .padStart(2, "0");

        return (
          <li
            key={track.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            <div>
              <span className="mr-3 text-xs text-white/50">
                #{(index + 1).toString().padStart(2, "0")}
              </span>
              <span className="font-semibold text-white">{track.title}</span>
              <span className="ml-2 text-white/60">{track.artist}</span>
            </div>
            <div className="text-xs text-white/50">{minutes}:{seconds}</div>
          </li>
        );
      })}
    </ul>
  );
};
