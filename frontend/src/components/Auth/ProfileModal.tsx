import React, { useEffect, useMemo, useState } from "react";
import { auth } from "../firebase/firebase";
import { Card } from "../Card";

type SummaryResponse = {
  total: number;
  mood_counts: Record<string, number>;
  top_songs: Array<{ label: string; count: number }>;
  recent: Array<{
    timestamp_utc: string;
    source: string;
    mood: string;
    detected_emotion: string;
    title: string;
    artist: string;
  }>;
};

const MOOD_LABELS: Record<string, string> = {
  "Szczęśliwy": "Szczęśliwy",
  "Smutny": "Smutny",
  "Spokojny": "Spokojny",
  "Energiczny": "Energiczny",
  "Zaskoczony": "Zaskoczony",
};

export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  const rows = useMemo(() => {
    const counts = summary?.mood_counts ?? {};
    const entries = Object.entries(counts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
    const max = Math.max(1, ...entries.map((e) => e.count));
    return { entries, max };
  }, [summary]);

  useEffect(() => {
    if (!open) return;

    (async () => {
      if (!auth.currentUser) {
        setSummary(null);
        setError("Zaloguj się, aby zobaczyć profil.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const uid = auth.currentUser.uid;
        const token = await auth.currentUser.getIdToken().catch(() => null);

        const resp = await fetch("/api/history/summary/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ uid }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || `HTTP ${resp.status}`);
        }

        const data = (await resp.json()) as SummaryResponse;
        setSummary(data);
      } catch (e) {
        setSummary(null);
        setError(e instanceof Error ? e.message : "Nie udało się pobrać profilu");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-3xl px-4">
        <Card title="Profil" className="lg:p-7">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70">Podsumowanie Twoich rekomendacji.</p>
            <button
              className="px-4 py-2 bg-white/20 rounded hover:bg-white/30"
              onClick={onClose}
            >
              Zamknij
            </button>
          </div>

          {loading && <p className="mt-4 text-sm text-white/60">Ładowanie…</p>}
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          {!loading && !error && summary && (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm text-white/70">Łącznie zapisów</p>
                <p className="mt-1 text-2xl font-bold text-white">{summary.total}</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Wykres nastrojów</p>
                <div className="mt-3 space-y-2">
                  {rows.entries.length === 0 ? (
                    <p className="text-sm text-white/60">Brak historii — wygeneruj kilka rekomendacji.</p>
                  ) : (
                    rows.entries.map((row) => (
                      <div key={row.mood} className="flex items-center gap-3">
                        <div className="w-28 text-xs text-white/70">{MOOD_LABELS[row.mood] ?? row.mood}</div>
                        <div className="flex-1 rounded-full bg-white/10 h-3 overflow-hidden">
                          <div
                            className="h-3 bg-white/30"
                            style={{ width: `${Math.round((row.count / rows.max) * 100)}%` }}
                          />
                        </div>
                        <div className="w-10 text-right text-xs text-white/60">{row.count}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Najczęstsze utwory</p>
                  <div className="mt-3 space-y-2">
                    {summary.top_songs.length === 0 ? (
                      <p className="text-sm text-white/60">Brak danych.</p>
                    ) : (
                      summary.top_songs.map((s) => (
                        <div key={s.label} className="flex items-center justify-between text-sm">
                          <span className="text-white/80 line-clamp-1">{s.label}</span>
                          <span className="text-white/60">{s.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Ostatnie rekomendacje</p>
                  <div className="mt-3 space-y-2">
                    {summary.recent.length === 0 ? (
                      <p className="text-sm text-white/60">Brak danych.</p>
                    ) : (
                      summary.recent.slice(0, 8).map((r, idx) => (
                        <div
                          key={`${r.timestamp_utc}_${idx}`}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white line-clamp-1">{r.title}</p>
                              <p className="text-xs text-white/60 line-clamp-1">{r.artist}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-white/70">{r.mood}</p>
                              <p className="text-[11px] text-white/50">{r.source}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
