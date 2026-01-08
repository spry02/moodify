import React, { useEffect, useState } from "react";
import { Card } from "./Card";
import { ControlToggles, ToggleKey } from "./ControlToggles";
import { DescriptionBox } from "./DescriptionBox";
import { CameraBox } from "./CameraBox";
import { MoodSelectPanel } from "./MoodSelectPanel";
import { GenerateButton } from "./GenerateButton";
import { SongsList, TrackItem } from "./SongsList";
import { PlaylistsList, PlaylistItem } from "./PlaylistsList";
import { RecommendationsSummary } from "./Recommendations";
import { AnalysisResult } from "./AnalysisResult";
import { MoodType } from "./types/types";
import UserPanel from "./Auth/UserPanel";
import { ThemeToggle } from "./ThemeToggle";
import { auth } from "./firebase/firebase";
import logo from "./assets/logo.png";

type Theme = "dark" | "light";

const gradient =
	"bg-[radial-gradient(1300px_700px_at_5%_35%,rgba(16,185,129,0.25),transparent),radial-gradient(1200px_650px_at_85%_-5%,rgba(79,70,229,0.35),transparent),linear-gradient(180deg,#05090f,#020308)]";

const lightGradient =
	"bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(79,70,229,0.25),transparent),radial-gradient(1200px_800px_at_-10%_30%,rgba(16,185,129,0.18),transparent),linear-gradient(180deg,rgba(148,163,184,0.35),white)]";

const MODULE_LABELS: Record<Exclude<ToggleKey, null>, string> = {
  description: "Opis",
  camera: "Kamera",
  mood: "Nastrój",
};

const THEME_STORAGE_KEY = "moodify-theme";

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const getInitialTheme = (): Theme => {
	if (typeof window === "undefined") {
		return "dark";
	}

	const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
	return stored === "light" ? "light" : "dark";
};

export default function MainDashboard() {
	const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [selectedModule, setSelectedModule] = useState<ToggleKey>(null);
  const [description, setDescription] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodType>("Szczęśliwy");
	const [analysisMood, setAnalysisMood] = useState<MoodType | null>(null);
	const [analysisSourceLabel, setAnalysisSourceLabel] = useState<string | null>(null);

  // Po usunięciu mocków - teraz są puste dopóki API nie zwróci danych
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);

		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, theme);
		} catch {
			// ignore storage errors (e.g., private mode)
		}
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

  const handlePhotoUpload = (file: File) => {
		setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setPhotoFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const getTracksfromDB = async () => {
	if (!auth.currentUser) return [];

	const uid = auth.currentUser.uid;
	const token = await auth.currentUser.getIdToken().catch(() => null);

	// Fetch history from Firebase via the API.
	const resp = await fetch("/api/history/items/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify({ uid, limit: 30 }),
	});

	if (!resp.ok) {
		const text = await resp.text();
		throw new Error(text || `HTTP ${resp.status}`);
	}

	const items = (await resp.json()) as Array<{
		timestamp_utc: string;
		title: string;
		artist: string;
		spotify_id?: string;
		source?: string;
		mood?: string;
		detected_emotion?: string;
	}>;

	setPlaylists(
		items.map((it, idx) => ({
			id: it.spotify_id || `hist_${idx}_${Date.now()}`,
			title: it.title,
			artist: it.artist,
			date: String(it.timestamp_utc || ""),
		}))
	);

  }

  const handleGenerate = async () => {
    if (!selectedModule) return;

    setIsGenerating(true);

		try {
			if (selectedModule === "camera") {
				if (!photoFile) return;

				const token = await auth.currentUser?.getIdToken();
				const uid = auth.currentUser?.uid;
				const formData = new FormData();
				formData.append("file", photoFile);
				if (uid) formData.append("uid", uid);

				const resp = await fetch("/api/image/mood/song/", {
					method: "POST",
					headers: token ? { Authorization: `Bearer ${token}` } : undefined,
					body: formData,
				});

				if (!resp.ok) {
					const text = await resp.text();
					throw new Error(text || `HTTP ${resp.status}`);
				}

				const data = (await resp.json()) as {
					detected_emotion: string;
					mood: MoodType;
					song: { title: string; artist: string; spotify_id?: string };
				};

				setDetectedEmotion(data.detected_emotion);
				setAnalysisMood(data.mood);
				setAnalysisSourceLabel("Analiza zdjęcia");
				setTracks([
					{
						id: data.song.spotify_id ?? `song_${Date.now()}`,
						title: data.song.title,
						artist: data.song.artist,
						durationMs: 180000,
					},
				]);
				// setPlaylists([]);
			} else if (selectedModule === "mood") {
				// Manual mood selection -> get a song for the selected mood
				setDetectedEmotion(null);
				setAnalysisMood(selectedMood);
				setAnalysisSourceLabel("Wybór nastroju");
				const uid = auth.currentUser?.uid ?? null;

				const resp = await fetch("/api/mood/song/", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ mood: selectedMood, uid }),
				});

				if (!resp.ok) {
					const text = await resp.text();
					throw new Error(text || `HTTP ${resp.status}`);
				}

				const data = (await resp.json()) as {
					mood: MoodType;
					song: { title: string; artist: string; spotify_id?: string };
				};

				setTracks([
					{
						id: data.song.spotify_id ?? `song_${Date.now()}`,
						title: data.song.title,
						artist: data.song.artist,
						durationMs: 180000,
					},
				]);
			} else if (selectedModule === "description") {
				// Text description -> predict mood -> song
				setDetectedEmotion(null);
				setAnalysisSourceLabel("Analiza opisu");
				const uid = auth.currentUser?.uid ?? null;

				const resp = await fetch("/api/text/mood/song/", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: description, uid }),
				});

				if (!resp.ok) {
					const text = await resp.text();
					throw new Error(text || `HTTP ${resp.status}`);
				}

				const data = (await resp.json()) as {
					detected_emotion?: string | null;
					mood: MoodType;
					song: { title: string; artist: string; spotify_id?: string };
				};

				setDetectedEmotion(data.detected_emotion ?? null);
				setAnalysisMood(data.mood);
				setTracks([
					{
						id: data.song.spotify_id ?? `song_${Date.now()}`,
						title: data.song.title,
						artist: data.song.artist,
						durationMs: 180000,
					},
				]);
			} else {
				setTracks([]);
				setPlaylists([]);
				setDetectedEmotion(null);
				setAnalysisMood(null);
				setAnalysisSourceLabel(null);
			}

			setGeneratedAt(formatDateTime(new Date()));
			try {
				await getTracksfromDB();
			} catch {
				// ignore history refresh errors
			}
		} finally {
			setIsGenerating(false);
		}
  };

//	HIDDEN FUNC TO LOAD LAST GENERATED DATA FROM DB
  useEffect(() => {
    (async () => {
      try {
        const dbTracks = await getTracksfromDB();
        // console.log(dbTracks)
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const activeModuleLabel = selectedModule
    ? MODULE_LABELS[selectedModule]
    : "Brak";

  const renderModulePanel = () => {
    switch (selectedModule) {
      case "description":
        return (
          <Card title="Opis nastroju" className="mx-auto max-w-4xl">
            <DescriptionBox value={description} onChange={setDescription} disabled={false} />
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
								setPhotoFile(null);
								setDetectedEmotion(null);
							setAnalysisMood(null);
							setAnalysisSourceLabel(null);
							setTracks([]);
              }}
              disabled={false}
            />
            {photoFileName && (
              <p className="mt-3 text-xs text-white/60">Załadowano: {photoFileName}</p>
            )}
          </Card>
        );

      case "mood":
        return (
          <Card title="Szybki wybór nastroju" className="mx-auto max-w-4xl">
            <MoodSelectPanel value={selectedMood} onChange={setSelectedMood} disabled={false} />
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
		<div
			className={`min-h-screen ${
				theme === "dark" ? gradient : lightGradient
			} ${theme === "dark" ? "text-white theme-dark" : "text-slate-900 theme-light"} transition-colors duration-300`}
		>
			{/* USER PANEL W PRAWYM GÓRNYM ROGU */}

			<div className="mx-auto max-w-6xl px-4 py-8">
				<header className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-20 w-20 rounded-xl">
                            <img src={logo} alt="Moodify" className="h-full w-full object-contain" />
						</div>
						<div>
							<h1 className="text-2xl font-extrabold tracking-tight">
								Moodify
							</h1>
							<p className="-mt-1 text-sm text-white/70">
								Twój nastrój. Twoja muzyka
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<ThemeToggle theme={theme} onToggle={toggleTheme} />
						<UserPanel />
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
									Aktywuj jeden z modułów, aby dopasować rekomendacje.
								</p>
							</div>

							<ControlToggles
								selected={selectedModule}
								onSelect={setSelectedModule}
							/>
						</div>
					</section>

										<div key={selectedModule ?? 'none'} className="animate-fade-slide-in">
                                            {renderModulePanel()}
                                        </div>

					<Card title="Generuj">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<p className="text-sm text-white/70">
									Uruchom silnik rekomendacji dla aktywnego modułu.
								</p>
								<p className="text-xs text-white/60">
									Aktywny moduł:{" "}
									<span className="text-white">{activeModuleLabel}</span>
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

					{/* Wynik Analizy */}
					{analysisMood && tracks.length > 0 && (
						<AnalysisResult
							detectedEmotion={detectedEmotion}
							assignedMood={analysisMood}
							songTitle={tracks[0].title}
							songArtist={tracks[0].artist}
							sourceLabel={analysisSourceLabel ?? undefined}
						/>
					)}

					<div className="space-y-5">
						<Card title="Podsumowanie analizy" className="lg:p-7">
							<RecommendationsSummary
								mood={analysisMood ?? selectedMood}
								description={description}
								tracksCount={tracks.length}
								generated={generatedAt}
								detectedEmotion={detectedEmotion}
							/>
						</Card>

						<div className="grid gap-5 md:grid-cols-2">
							<Card title="Utwory dopasowane">
								<SongsList tracks={tracks} />
							</Card>

							<Card title="Poprzednie utwory">
								<PlaylistsList items={playlists} />
							</Card>
						</div>	
						
					</div>
				</main>
			</div>
		</div>
	);
	
}
