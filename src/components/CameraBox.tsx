import React, { useRef } from "react";

interface CameraBoxProps {
  preview: string | null;
  onUpload: (file: File) => void;
  onReset: () => void;
  disabled: boolean;
}

export const CameraBox: React.FC<CameraBoxProps> = ({
  preview,
  onUpload,
  onReset,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-full flex-col">
      <label className="text-sm font-semibold text-white">Analiza twarzy</label>
      <div
        className={`mt-3 flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-center transition ${
          disabled ? "opacity-40" : "hover:border-white/40"
        }`}
      >
        {preview ? (
          <div className="flex w-full flex-col items-center gap-4">
            <img
              src={preview}
              alt="Podgląd"
              className="aspect-square w-full max-w-[220px] rounded-2xl object-cover"
            />
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Usuń zdjęcie
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePick}
            className="flex flex-col items-center gap-3 text-white/70"
          >
            <span className="text-lg font-semibold text-white">
              Dodaj zdjęcie do analizy
            </span>
            <span className="text-xs">
              Obsługujemy pliki PNG i JPG. Dane nie są nigdzie wysyłane.
            </span>
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onUpload(file);
        }}
        disabled={disabled}
      />
      <p className="mt-3 text-xs text-white/60">
        Zdjęcie służy do detekcji emocji. Wybierz moduł „Kamera”, aby aktywować.
      </p>
    </div>
  );
};
