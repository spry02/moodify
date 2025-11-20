import React from "react";
import { Gauge } from "lucide-react";

interface UserPanelProps {
  generatedAt: string | null;
  activeModule: string;
}

export const UserPanel: React.FC<UserPanelProps> = ({
  generatedAt,
  activeModule,
}) => {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <p className="text-sm font-semibold text-white">Witaj, Moodifier!</p>
        <p className="text-xs text-white/60">
          Steruj modułami, aby uzyskać najtrafniejsze rekomendacje.
        </p>
      </div>
      <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/50">
          <Gauge className="h-4 w-4" /> Stan sesji
        </div>
        <div className="mt-2 text-sm text-white/80">
          <p>
            Aktywny moduł: <span className="text-white">{activeModule}</span>
          </p>
          <p className="text-white/50">
            Ostatnie generowanie: {generatedAt ? generatedAt : "brak"}
          </p>
        </div>
      </div>
    </div>
  );
};
