"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Volume2, VolumeX } from "lucide-react";

export type ImageStyle = "artwork" | "pixels";
type AudioStatus = "idle" | "playing" | "blocked" | "unavailable";
type ActiveSpecies = { name: string; cry: string | null };
type Preferences = {
  sound: boolean;
  imageStyle: ImageStyle;
  audioStatus: AudioStatus;
  toggleSound: () => void;
  setImageStyle: (style: ImageStyle) => void;
  requestSpecies: (name: string) => void;
  activateSpecies: (name: string, cry: string | null) => () => void;
};
const PreferencesContext = createContext<Preferences | null>(null);
export function useGuidePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("Guide preferences require their provider.");
  return value;
}
function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
export function GuidePreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sound, setSound] = useState(true);
  const [imageStyle, updateImageStyle] = useState<ImageStyle>("artwork");
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const enabled = useRef(true);
  const audio = useRef<HTMLAudioElement | null>(null);
  const active = useRef<ActiveSpecies | null>(null);
  const pending = useRef<string | null>(null);
  const stop = useCallback(() => {
    const previous = audio.current;
    audio.current = null;
    if (previous) {
      previous.onended = null;
      previous.onerror = null;
      previous.pause();
      previous.removeAttribute("src");
      previous.load();
    }
    setAudioStatus("idle");
  }, []);
  const play = useCallback(
    (cry: string | null) => {
      stop();
      if (!enabled.current) return;
      if (!cry) {
        setAudioStatus("unavailable");
        return;
      }
      const next = new Audio(cry);
      audio.current = next;
      next.volume = 0.45;
      next.onended = () => {
        if (audio.current === next) setAudioStatus("idle");
      };
      next.onerror = () => {
        if (audio.current === next) setAudioStatus("unavailable");
      };
      void next
        .play()
        .then(() => {
          if (audio.current === next) setAudioStatus("playing");
        })
        .catch((error: unknown) => {
          if (audio.current === next)
            setAudioStatus(
              error instanceof DOMException && error.name === "NotAllowedError"
                ? "blocked"
                : "unavailable",
            );
        });
    },
    [stop],
  );
  useEffect(() => {
    let savedSound = true,
      savedStyle: ImageStyle = "artwork";
    try {
      savedSound = localStorage.getItem("pokedex-sound") !== "off";
      savedStyle =
        localStorage.getItem("pokedex-image-style") === "pixels"
          ? "pixels"
          : "artwork";
    } catch {}
    enabled.current = savedSound;
    const frame = requestAnimationFrame(() => {
      setSound(savedSound);
      updateImageStyle(savedStyle);
    });
    return () => {
      cancelAnimationFrame(frame);
      stop();
    };
  }, [stop]);
  const toggleSound = useCallback(() => {
    const next = !enabled.current;
    enabled.current = next;
    setSound(next);
    persist("pokedex-sound", next ? "on" : "off");
    if (!next) stop();
    else if (active.current) play(active.current.cry);
  }, [play, stop]);
  const setImageStyle = useCallback((style: ImageStyle) => {
    updateImageStyle(style);
    persist("pokedex-image-style", style);
  }, []);
  const requestSpecies = useCallback(
    (name: string) => {
      stop();
      pending.current = name;
      if (active.current?.name === name) {
        pending.current = null;
        play(active.current.cry);
      }
    },
    [play, stop],
  );
  const activateSpecies = useCallback(
    (name: string, cry: string | null) => {
      const entry = { name, cry };
      active.current = entry;
      if (pending.current === name) {
        pending.current = null;
        play(cry);
      }
      // A replacement effect (including Strict Mode) takes ownership before cleanup.
      return () =>
        queueMicrotask(() => {
          if (active.current === entry) {
            active.current = null;
            stop();
          }
        });
    },
    [play, stop],
  );
  const value = useMemo(
    () => ({
      sound,
      imageStyle,
      audioStatus,
      toggleSound,
      setImageStyle,
      requestSpecies,
      activateSpecies,
    }),
    [
      sound,
      imageStyle,
      audioStatus,
      toggleSound,
      setImageStyle,
      requestSpecies,
      activateSpecies,
    ],
  );
  return <PreferencesContext value={value}>{children}</PreferencesContext>;
}
export function SoundToggle() {
  const { sound, toggleSound, audioStatus } = useGuidePreferences();
  const label = sound ? "Sound on" : "Sound off";
  const hint =
    audioStatus === "blocked"
      ? "Playback blocked. Toggle Sound off then on to retry."
      : audioStatus === "unavailable"
        ? "A cry is unavailable for this selection."
        : "Plays a cry when you select a Pokémon.";
  return (
    <div className="sound-control">
      <button
        className="fg-button sound-toggle"
        type="button"
        aria-label={label}
        aria-pressed={sound}
        onClick={toggleSound}
        title={`${label}. ${hint}`}
      >
        {sound ? (
          <Volume2 size={18} aria-hidden />
        ) : (
          <VolumeX size={18} aria-hidden />
        )}
        <span className="sound-label">{label}</span>
      </button>
      <span className="sr-only" role="status">
        {audioStatus === "blocked" || audioStatus === "unavailable" ? hint : ""}
      </span>
    </div>
  );
}
