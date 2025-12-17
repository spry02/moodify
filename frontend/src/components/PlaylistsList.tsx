import React from "react";

export interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  date: string
}

interface PlaylistsListProps {
  items: PlaylistItem[];
}

export const PlaylistsList: React.FC<PlaylistsListProps> = ({ items }) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/60">
        Tutaj pojawią się gotowe playlisty na podstawie Twojego nastroju.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((track, index) => {
        const dmy = track.date.split("T")[0]
        const time = track.date.split("T")[1]

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
            <div className="text-xs text-white/50">{dmy} {time}</div>
          </li>
        );
      })}
    </ul>
  );
};
