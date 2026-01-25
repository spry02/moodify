import React from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === "dark";
  const label = isDark ? "Włącz tryb jasny" : "Włącz tryb ciemny";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="focus:outline-none"
      aria-pressed={!isDark}
      aria-label={label}
      title={label}
    >
      <span className="sr-only">{label}</span>
      <div className="relative h-10 w-20 rounded-full border border-white/20 bg-white/10 px-3 transition-colors duration-300">
        <Moon
          className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
            isDark ? "text-indigo-400" : "text-white/30"
          }`}
        />
        <Sun
          className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
            !isDark ? "text-amber-300" : "text-white/30"
          }`}
        />
        <span
          className={`pointer-events-none absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-white shadow-lg transition-transform duration-300 ${
            isDark ? "left-2" : "right-2"
          }`}
        />
      </div>
    </button>
  );
};
