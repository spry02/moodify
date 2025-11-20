import React from "react";
import { MoodType } from "../types";

interface MoodSelectPanelProps {
  value: MoodType;
  onChange: (value: MoodType) => void;
  disabled: boolean;
}

const MOODS: MoodType[] = [
  "Szczęśliwy",
  "Smutny",
  "Zestresowany",
  "Spokojny",
  "Zmęczony",
];

export const MoodSelectPanel: React.FC<MoodSelectPanelProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex h-full flex-col">
      <label className="text-sm font-semibold text-white">Szybki wybór nastroju</label>
      <div className="mt-3 grid flex-1 grid-cols-2 gap-2">
        {MOODS.map((mood) => {
          const isSelected = value === mood;
          return (
            <button
              key={mood}
              type="button"
              onClick={() => onChange(mood)}
              disabled={disabled}
              className={`rounded-2xl border px-4 py-3 text-sm transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                  : "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:text-white"
              }`}
            >
              {mood}
            </button>
          );
        })}
      </div>
    </div>
  );
};
