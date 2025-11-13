import React from "react";

interface DescriptionBoxProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const DescriptionBox: React.FC<DescriptionBoxProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex h-full flex-col">
      <label className="text-sm font-semibold text-white">Opis nastroju</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Jak się czujesz dzisiaj?"
        className="mt-3 h-full resize-none rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/30"
        disabled={disabled}
      />
      <p className="mt-3 text-xs text-white/60">
        Tekst wpływa na kontekst rekomendacji. Opcja aktywna tylko po wybraniu
        modułu „Opis”.
      </p>
    </div>
  );
};
