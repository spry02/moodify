import React, { useState } from "react";
import { Card } from "./components/Card";
import { ControlToggles, ToggleKey } from "./components/ControlToggles";
import { DescriptionBox } from "./components/DescriptionBox";
import { CameraBox } from "./components/CameraBox";
import { MoodSelectPanel } from "./components/MoodSelectPanel";
import { GenerateButton } from "./components/GenerateButton";
import { SongsList, TrackItem } from "./components/SongsList";
import { PlaylistsList, PlaylistItem } from "./components/PlaylistsList";
import { RecommendationsSummary } from "./components/Recommendations";
import { MoodType } from "./types";

const gradient =
  "bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(99,102,241,0.35),transparent),radial-gradient(1200px_800px_at_-10%_30%,rgba(34,197,94,0.25),transparent),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]";

const MODULE_LABELS: Record<Exclude<ToggleKey, null>, string> = {
  description: "Opis",
  camera: "Kamera",
  mood: "Nastrój",
};

const MOCK_TRACKS: TrackItem[] = Array.from({ length: 10 }).map((_, index) => ({
  id: `track_${index}`,
  title: [
    "Sunrise Drive",
    "Midnight Lo-Fi",
    "Calm Harbor",
    "Neon Pulse",
    "Soft Echoes",
    "Fire Within",
    "Still Waters",
    "Skyline",
    "Velvet Bloom",
    "Electric Dawn",
  ][index],
  artist: [
    "Aurelia",
    "nuit bleu",
    "Quiet Tide",
    "VXR",
    "Soma",
    "Emberfall",
    "Isla",
    "Harmone",
    "Mallow",
    "Dawnlight",
  ][index],
  durationMs: 150000 + index * 7000,
}));

const MOCK_PLAYLISTS: PlaylistItem[] = [
  {
    id: "pl_1",
    title: "Sunrise Chill",
    description: "Poranne lo-fi do spokojnego startu dnia",
    followers: 15820,
  },
  {
    id: "pl_2",
    title: "Neon Vibes",
    description: "Energetyczne syntezatory dla miejskiej nocy",
    followers: 48230,
  },
  {
    id: "pl_3",
    title: "Mindful Focus",
    description: "Delikatne ambienty do pracy i nauki",
    followers: 22190,
  },
];

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export default function App() {
  const [selectedModule, setSelectedModule] = useState<ToggleKey>(null);
  const [description, setDescription] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodType>("Szczęśliwy");
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setPhotoFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selectedModule) {
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const shuffledTracks = [...MOCK_TRACKS].sort(() => Math.random() - 0.5);
    setTracks(shuffledTracks.slice(0, 6));
    setPlaylists(MOCK_PLAYLISTS.slice(0, 3));
    setGeneratedAt(formatDateTime(new Date()));
    setIsGenerating(false);
  };

  const activeModuleLabel = selectedModule
    ? MODULE_LABELS[selectedModule]
    : "Brak";

  const renderModulePanel = () => {
    switch (selectedModule) {
      case "description":
        return (
          <Card title="Opis nastroju" className="mx-auto max-w-4xl">
            <DescriptionBox
              value={description}
              onChange={setDescription}
              disabled={false}
            />
          </Card>
        );
      case "camera":
        return (
          <Card title="Analiza kamery" className="mx-auto max-w-4xl">
            <CameraBox
              preview={photoPreview}
              onUpload={handlePhotoUpload}
              onReset={() => {
                setPhotoPreview(null);
                setPhotoFileName(null);
              }}
              disabled={false}
            />
            {photoFileName && (
              <p className="mt-3 text-xs text-white/60">
                Załadowano: {photoFileName}
              </p>
            )}
          </Card>
        );
      case "mood":
        return (
          <Card title="Szybki wybór nastroju" className="mx-auto max-w-4xl">
            <MoodSelectPanel
              value={selectedMood}
              onChange={setSelectedMood}
              disabled={false}
            />
          </Card>
        );
      default:
        return (
          <Card title="Panel modułu" className="mx-auto max-w-4xl text-center">
            <p className="text-sm text-white/60">
              Wybierz przycisk powyżej, aby wyświetlić odpowiedni panel.
            </p>
          </Card>
        );
    }
  };

  return (
    <div className={`min-h-screen ${gradient} text-white`}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-white/10">
              <span className="text-sm font-bold">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Moodify</h1>
              <p className="-mt-1 text-sm text-white/70">
                Twój nastrój. Twoja muzyka
              </p>
            </div>
          </div>
        </header>

        <main className="mt-10 space-y-6">
          <section className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Wybierz moduł analizy
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  Aktywuj jeden z modułów, aby dopasować rekomendacje do swoich danych.
                </p>
              </div>
              <ControlToggles
                selected={selectedModule}
                onSelect={setSelectedModule}
              />
            </div>
          </section>

          {renderModulePanel()}

          <Card title="Generuj">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-white/70">
                  Uruchom silnik rekomendacji dla aktywnego modułu.
                </p>
                <p className="text-xs text-white/60">
                  Aktywny moduł: <span className="text-white">{activeModuleLabel}</span>
                </p>
                {generatedAt && (
                  <p className="text-xs text-emerald-200/90">
                    Ostatnie generowanie: {generatedAt}
                  </p>
                )}
              </div>
              <GenerateButton
                onClick={handleGenerate}
                disabled={!selectedModule || isGenerating}
                isLoading={isGenerating}
              />
            </div>
          </Card>

          <div className="space-y-5">
            <Card title="Podsumowanie analizy" className="lg:p-7">
              <RecommendationsSummary
                mood={selectedMood}
                description={description}
                tracksCount={tracks.length}
                generated={generatedAt}
              />
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              <Card title="Utwory dopasowane">
                <SongsList tracks={tracks} />
              </Card>
              <Card title="Propozycje playlist">
                <PlaylistsList items={playlists} />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
