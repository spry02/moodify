import React from "react";

export interface PlaylistItem {
  id: string;
  title: string;
  description: string;
  followers: number;
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
      {items.map((playlist) => (
        <li
          key={playlist.id}
          className="rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {playlist.title}
              </p>
              <p className="text-xs text-white/60">{playlist.description}</p>
            </div>
            <span className="text-xs text-white/50">
              {playlist.followers.toLocaleString("pl-PL")}
              <span className="ml-1 text-white/30">obserwujących</span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};
