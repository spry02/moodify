import React from "react";

export interface HistoryItem {
  id: string;
  title: string;
  artist: string;
  date: string;
  url: string;
}

interface HistoryListProps {
  items: HistoryItem[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ items }) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/60">
        Tutaj pojawi się historia twoich utworów.
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
              <a href={track.url} target="_blank"><span className="font-semibold text-white">{track.title}</span></a>
              <span className="ml-2 text-white/60">{track.artist}</span>
            </div>
            <div className="text-xs text-white/50">{dmy} {time}</div>
          </li>
        );
      })}
    </ul>
  );
};
