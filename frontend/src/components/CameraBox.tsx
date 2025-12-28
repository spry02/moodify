import React, { useEffect, useMemo, useRef, useState } from "react";

interface CameraBoxProps {
  preview: string | null;
  onUpload: (file: File) => void;
  onReset: () => void;
  disabled: boolean;
}

type CaptureMode = "camera" | "file";

export const CameraBox: React.FC<CameraBoxProps> = ({
  preview,
  onUpload,
  onReset,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<CaptureMode>("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const cameraSupported = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return Boolean(navigator.mediaDevices?.getUserMedia);
  }, []);

  const stopStream = () => {
    const stream = streamRef.current;
    if (!stream) return;
    for (const track of stream.getTracks()) {
      try {
        track.stop();
      } catch {
        // ignore
      }
    }
    streamRef.current = null;
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }
  };

  const handlePick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleCapture = async () => {
    if (disabled) return;
    setCameraError(null);

    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError("Nie udało się przechwycić obrazu (brak canvas).");
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92)
    );

    if (!blob) {
      setCameraError("Nie udało się utworzyć zdjęcia.");
      return;
    }

    const file = new File([blob], `camera_${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    stopStream();
    onUpload(file);
  };

  useEffect(() => {
    if (disabled) {
      stopStream();
      return;
    }

    if (preview) {
      stopStream();
      return;
    }

    if (mode !== "camera") {
      stopStream();
      return;
    }

    if (!cameraSupported) {
      setCameraError("Ta przeglądarka nie obsługuje kamery.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
            // Some browsers require user gesture; show error.
          });
        }
      } catch (e) {
        stopStream();
        const msg =
          e instanceof Error
            ? e.message
            : "Brak dostępu do kamery (odmowa uprawnień lub brak urządzenia).";
        setCameraError(msg);
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, disabled, preview, cameraSupported]);

  return (
    <div className="flex h-full flex-col">
      <label className="text-sm font-semibold text-white">Analiza twarzy</label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            setMode("camera");
          }}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition focus:outline-none ${
            mode === "camera"
              ? "border-emerald-400/70 bg-emerald-400/20 text-emerald-50"
              : "border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/15 hover:text-white"
          }`}
          disabled={disabled}
        >
          Kamera
        </button>
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            setMode("file");
          }}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition focus:outline-none ${
            mode === "file"
              ? "border-emerald-400/70 bg-emerald-400/20 text-emerald-50"
              : "border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/15 hover:text-white"
          }`}
          disabled={disabled}
        >
          Plik
        </button>
      </div>

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
        ) : mode === "camera" ? (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <video
                ref={videoRef}
                className="aspect-video w-full object-cover"
                playsInline
                muted
              />
            </div>

            {cameraError ? (
              <p className="text-xs text-rose-200/90">{cameraError}</p>
            ) : (
              <p className="text-xs text-white/60">
                Upewnij się, że przyznałeś dostęp do kamery.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCapture}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:border-white/40 hover:bg-white/15"
                disabled={disabled || Boolean(cameraError)}
              >
                Zrób zdjęcie
              </button>
              <button
                type="button"
                onClick={handlePick}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                disabled={disabled}
              >
                Wybierz plik
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePick}
            className="flex flex-col items-center gap-3 text-white/70"
            disabled={disabled}
          >
            <span className="text-lg font-semibold text-white">
              Dodaj zdjęcie do analizy
            </span>
            <span className="text-xs">
              Obsługujemy pliki PNG i JPG. Zdjęcie zostanie wysłane do analizy.
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
        Zdjęcie służy do detekcji emocji. Wybierz źródło: „Kamera” lub „Plik”.
      </p>
    </div>
  );
};
