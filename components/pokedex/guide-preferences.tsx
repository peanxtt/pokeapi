"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ControlPopover } from "./control-popover";

export type ImageStyle = "artwork" | "pixels";
type AudioStatus = "idle" | "playing" | "blocked" | "unavailable";
type ActiveSpecies = { name: string; cry: string | null };
type Preferences = {
  sound: boolean;
  volume: number;
  imageStyle: ImageStyle;
  audioStatus: AudioStatus;
  toggleSound: () => void;
  setVolume: (volume: number) => void;
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
  const [volume, updateVolume] = useState(45);
  const [imageStyle, updateImageStyle] = useState<ImageStyle>("artwork");
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const enabled = useRef(true);
  const currentVolume = useRef(45);
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
      next.volume = currentVolume.current / 100;
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
      savedVolume = 45,
      savedStyle: ImageStyle = "artwork";
    try {
      savedSound = localStorage.getItem("pokedex-sound") !== "off";
      const storedVolume = localStorage.getItem("pokedex-volume");
      if (storedVolume?.trim() && Number.isFinite(Number(storedVolume)))
        savedVolume = Math.round(Math.min(100, Math.max(0, Number(storedVolume))));
      savedStyle =
        localStorage.getItem("pokedex-image-style") === "pixels"
          ? "pixels"
          : "artwork";
    } catch {}
    enabled.current = savedSound;
    currentVolume.current = savedVolume;
    const frame = requestAnimationFrame(() => {
      setSound(savedSound);
      updateVolume(savedVolume);
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
  const setVolume = useCallback((value: number) => {
    if (!Number.isFinite(value)) return;
    const next = Math.round(Math.min(100, Math.max(0, value)));
    currentVolume.current = next;
    updateVolume(next);
    if (audio.current) audio.current.volume = next / 100;
    persist("pokedex-volume", String(next));
  }, []);
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
      volume,
      imageStyle,
      audioStatus,
      toggleSound,
      setVolume,
      setImageStyle,
      requestSpecies,
      activateSpecies,
    }),
    [
      sound,
      volume,
      imageStyle,
      audioStatus,
      toggleSound,
      setVolume,
      setImageStyle,
      requestSpecies,
      activateSpecies,
    ],
  );
  return <PreferencesContext value={value}>{children}</PreferencesContext>;
}
export function SoundToggle() {
  const { sound, volume, toggleSound, setVolume, audioStatus } =
    useGuidePreferences();
  const volumeId = useId();
  const label = sound ? "Sound on" : "Sound off";
  const hint =
    audioStatus === "blocked"
      ? "Playback blocked. Toggle Sound off then on to retry."
      : audioStatus === "unavailable"
        ? "A cry is unavailable for this selection."
        : "Plays a cry when you select a Pokémon.";
  return (
    <>
      <ControlPopover
        className="sound-control"
        title="Sound"
        accessibleLabel="Sound settings"
        description={`${label}. Volume ${volume}%. ${hint}`}
        label={
          <>
            {sound && volume > 0 ? (
              <Volume2 size={18} aria-hidden />
            ) : (
              <VolumeX size={18} aria-hidden />
            )}
            <span className="sound-label">{label}</span>
          </>
        }
      >
        {() => (
          <>
            <button
              className="fg-button sound-mute"
              type="button"
              aria-label={sound ? "Mute sound" : "Enable sound"}
              aria-pressed={sound}
              onClick={toggleSound}
              title={hint}
            >
              {sound ? (
                <Volume2 size={18} aria-hidden />
              ) : (
                <VolumeX size={18} aria-hidden />
              )}
              <span>{label}</span>
            </button>
            <div className="volume-heading">
              <label htmlFor={volumeId}>Cry volume</label>
              <output htmlFor={volumeId}>{volume}%</output>
            </div>
            <input
              id={volumeId}
              className="volume-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={volume}
              aria-valuetext={`${volume}%${sound ? "" : ", sound is off"}`}
              onChange={(event) => setVolume(event.currentTarget.valueAsNumber)}
            />
            <p>{sound ? hint : "Sound is off. Your volume is saved."}</p>
          </>
        )}
      </ControlPopover>
      <span className="sr-only" role="status">
        {audioStatus === "blocked" || audioStatus === "unavailable" ? hint : ""}
      </span>
    </>
  );
}
