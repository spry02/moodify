import React from "react";

type ToggleKey = "description" | "camera" | "mood" | null;

interface ControlTogglesProps {
  selected: ToggleKey;
  onSelect: (value: ToggleKey) => void;
}

const TOGGLE_ITEMS: { id: Exclude<ToggleKey, null>; label: string }[] = [
  { id: "description", label: "Opis" },
  { id: "camera", label: "Kamera" },
  { id: "mood", label: "Nastrój" },
];

export const ControlToggles: React.FC<ControlTogglesProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {TOGGLE_ITEMS.map((item) => {
        const isActive = selected === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(isActive ? null : item.id)}
            className={`min-w-[140px] flex-1 rounded-2xl border px-6 py-4 text-base font-semibold transition focus:outline-none ${
              isActive
                ? "border-emerald-400/70 bg-emerald-400/20 text-emerald-50 shadow-[0_0_25px_rgba(74,222,128,0.2)]"
                : "border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/15 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export type { ToggleKey };
