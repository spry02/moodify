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

type HistoryItem = {
  timestamp_utc: string;
  source: string;
  mood: string;
  detected_emotion: string;
  title: string;
  artist: string;
  spotify_id?: string;
};

const MOOD_LABELS: Record<string, string> = {
  "Szczęśliwy": "Szczęśliwy",
  "Smutny": "Smutny",
  "Spokojny": "Spokojny",
  "Energiczny": "Energiczny",
  "Zaskoczony": "Zaskoczony",
};

const HISTORY_HEADERS = [
  "timestamp_utc",
  "source",
  "mood",
  "detected_emotion",
  "title",
  "artist",
  "spotify_id",
];

const CHART_HEADERS = ["mood", "count"];

const escapeCsv = (value: unknown) => {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

const buildCsv = (headers: string[], rows: Array<Record<string, unknown>>) => {
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(","));
  });
  return lines.join("\r\n");
};

const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportingHistory, setExportingHistory] = useState(false);
  const [exportingChart, setExportingChart] = useState(false);

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
    setExportError(null);

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

  const handleExportHistory = async () => {
    if (!auth.currentUser) {
      setExportError("Zaloguj sie, aby eksportowac dane.");
      return;
    }

    setExportingHistory(true);
    setExportError(null);
    try {
      const uid = auth.currentUser.uid;
      const token = await auth.currentUser.getIdToken().catch(() => null);

      const resp = await fetch("/api/history/items/", {
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

      const items = (await resp.json()) as HistoryItem[];
      if (!items || items.length === 0) {
        setExportError("Brak danych do eksportu.");
        return;
      }

      const csvRows = items.map((item) => ({
        timestamp_utc: item.timestamp_utc ?? "",
        source: item.source ?? "",
        mood: item.mood ?? "",
        detected_emotion: item.detected_emotion ?? "",
        title: item.title ?? "",
        artist: item.artist ?? "",
        spotify_id: item.spotify_id ?? "",
      }));

      const csv = buildCsv(HISTORY_HEADERS, csvRows);
      downloadCsv(`moodify-history-${uid}.csv`, csv);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Nie udalo sie eksportowac danych.");
    } finally {
      setExportingHistory(false);
    }
  };

  const handleExportChart = () => {
    if (!summary || rows.entries.length === 0) {
      setExportError("Brak danych do eksportu wykresu.");
      return;
    }

    setExportingChart(true);
    setExportError(null);
    try {
      const csvRows = rows.entries.map((row) => ({
        mood: MOOD_LABELS[row.mood] ?? row.mood,
        count: row.count,
      }));
      const csv = buildCsv(CHART_HEADERS, csvRows);
      downloadCsv("moodify-mood-chart.csv", csv);
    } finally {
      setExportingChart(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-3xl px-4">
        <Card title="Podsumowanie" className="lg:p-7">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70">Podsumowanie Twoich rekomendacji.</p>
            <div className="flex items-center gap-2">
              
              <button
                className="px-4 py-2 bg-white/20 rounded hover:bg-white/30"
                onClick={onClose}
              >
                Zamknij
              </button>
            </div>
          </div>

          {loading && <p className="mt-4 text-sm text-white/60">Ładowanie…</p>}
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          {exportError && <p className="mt-3 text-sm text-amber-300">{exportError}</p>}

          {!loading && !error && summary && (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm text-white/70">Łącznie zapisów</p>
                <p className="mt-1 text-2xl font-bold text-white">{summary.total}</p>
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
