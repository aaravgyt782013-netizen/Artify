import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Track } from "./types";
import { audius } from "./audius";
import { fileDb } from "./db";
import { useLibrary } from "./library";

export type Repeat = "off" | "all" | "one";

interface PlayerCtx {
  queue: Track[];
  index: number;
  current: Track | null;
  isPlaying: boolean;
  buffering: boolean;
  error: string | null;
  shuffle: boolean;
  repeat: Repeat;
  volume: number;
  muted: boolean;
  sleepAt: number | null;
  playTracks: (tracks: Track[], start?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  jumpTo: (i: number) => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (t: Track) => void;
  playNext: (t: Track) => void;
  removeFromQueue: (i: number) => void;
  setSleepTimer: (minutes: number | null) => void;
}

interface ProgressCtx {
  time: number;
  duration: number;
  buffered: number;
}

const Ctx = createContext<PlayerCtx | null>(null);
const Progress = createContext<ProgressCtx>({ time: 0, duration: 0, buffered: 0 });

function shuffled<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function resolveSrc(t: Track): Promise<string> {
  // Downloaded (artist-permitted) tracks play from the device first.
  const dl = await fileDb.get(`dl:${t.id}`).catch(() => undefined);
  if (dl) return URL.createObjectURL(dl);
  if (t.source === "local" && t.localId) {
    const blob = await fileDb.get(t.localId);
    if (!blob) throw new Error("File missing from this device");
    return URL.createObjectURL(blob);
  }
  return audius.streamUrl(t);
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { pushRecent, notify } = useLibrary();
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const preloadRef = useRef<HTMLAudioElement>(new Audio());
  const objectUrl = useRef<string | null>(null);

  const [queue, setQueue] = useState<Track[]>([]);
  const [original, setOriginal] = useState<Track[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<Repeat>("off");
  const [volume, setVolumeState] = useState(() => Number(localStorage.getItem("artify:volume") ?? 0.8));
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState<ProgressCtx>({ time: 0, duration: 0, buffered: 0 });
  const [sleepAt, setSleepAt] = useState<number | null>(null);

  const current = index >= 0 ? queue[index] ?? null : null;
  const state = useRef({ queue, index, repeat });
  state.current = { queue, index, repeat };

  // Load a new track whenever the current one changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!current) return;
    let cancelled = false;
    setError(null);
    setBuffering(true);
    resolveSrc(current)
      .then((src) => {
        if (cancelled) return;
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = src.startsWith("blob:") ? src : null;
        audio.src = src;
        return audio.play();
      })
      .then(() => { if (!cancelled) pushRecent(current); })
      .catch((e: Error) => {
        if (cancelled || e.name === "AbortError") return;
        setError(e.message || "Playback failed");
        setBuffering(false);
      });

    // Warm up the next track so transitions are seamless.
    const nxt = queue[index + 1];
    if (nxt && nxt.source === "audius") {
      preloadRef.current.preload = "auto";
      preloadRef.current.src = audius.streamUrl(nxt);
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, index]);

  const next = useCallback(() => {
    const { queue, index, repeat } = state.current;
    if (!queue.length) return;
    if (index + 1 < queue.length) setIndex(index + 1);
    else if (repeat === "all") setIndex(0);
    else { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  }, []);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    const { index } = state.current;
    if (audio.currentTime > 3 || index <= 0) audio.currentTime = 0;
    else setIndex(index - 1);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!state.current.queue.length) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  // Audio element events.
  useEffect(() => {
    const a = audioRef.current;
    a.volume = volume;
    const onTime = () =>
      setProgress({
        time: a.currentTime,
        duration: isFinite(a.duration) ? a.duration : 0,
        buffered: a.buffered.length ? a.buffered.end(a.buffered.length - 1) : 0,
      });
    const onEnded = () => {
      if (state.current.repeat === "one") { a.currentTime = 0; a.play(); }
      else next();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    const onError = () => {
      setBuffering(false);
      setError("This track couldn't be played — skipping");
      setTimeout(next, 1200);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("durationchange", onTime);
    a.addEventListener("progress", onTime);
    a.addEventListener("ended", onEnded);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("playing", onPlaying);
    a.addEventListener("canplay", onPlaying);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("durationchange", onTime);
      a.removeEventListener("progress", onTime);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("canplay", onPlaying);
      a.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next]);

  useEffect(() => {
    audioRef.current.volume = muted ? 0 : volume;
    localStorage.setItem("artify:volume", String(volume));
  }, [volume, muted]);

  // OS media controls / lock-screen / headphone buttons.
  useEffect(() => {
    if (!("mediaSession" in navigator) || !current) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: "Artify",
      artwork: current.artworkLarge ? [{ src: current.artworkLarge, sizes: "1000x1000" }] : [{ src: "/logo.svg" }],
    });
    navigator.mediaSession.setActionHandler("play", toggle);
    navigator.mediaSession.setActionHandler("pause", toggle);
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", prev);
    navigator.mediaSession.setActionHandler("seekto", (d) => {
      if (d.seekTime != null) audioRef.current.currentTime = d.seekTime;
    });
  }, [current, toggle, next, prev]);

  useEffect(() => {
    document.title = current ? `${current.title} • ${current.artist} — Artify` : "Artify";
  }, [current]);

  // Sleep timer.
  useEffect(() => {
    if (!sleepAt) return;
    const id = window.setTimeout(() => {
      audioRef.current.pause();
      setSleepAt(null);
      notify("Sleep timer ended — goodnight 🌙");
    }, Math.max(0, sleepAt - Date.now()));
    return () => clearTimeout(id);
  }, [sleepAt, notify]);

  const value: PlayerCtx = {
    queue, index, current, isPlaying, buffering, error, shuffle, repeat, volume, muted, sleepAt,
    playTracks: (tracks, start = 0) => {
      if (!tracks.length) return;
      setOriginal(tracks);
      if (shuffle) {
        const first = tracks[start];
        const rest = shuffled(tracks.filter((_, i) => i !== start));
        setQueue([first, ...rest]);
        setIndex(0);
      } else {
        setQueue(tracks);
        setIndex(start);
      }
      // Replaying the same track: force restart.
      if (tracks[start]?.id === current?.id) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    },
    toggle, next, prev,
    jumpTo: (i) => setIndex(i),
    seek: (t) => { audioRef.current.currentTime = t; },
    setVolume: (v) => { setVolumeState(v); if (v > 0) setMuted(false); },
    toggleMute: () => setMuted((m) => !m),
    toggleShuffle: () => {
      setShuffle((s) => {
        const on = !s;
        if (current) {
          if (on) {
            const rest = shuffled(queue.filter((_, i) => i !== index));
            setQueue([current, ...rest]);
            setIndex(0);
          } else if (original.length) {
            const i = original.findIndex((t) => t.id === current.id);
            setQueue(original);
            setIndex(i >= 0 ? i : 0);
          }
        }
        return on;
      });
    },
    cycleRepeat: () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    addToQueue: (t) => {
      if (!queue.length) { setQueue([t]); setOriginal([t]); setIndex(0); return; }
      setQueue((q) => [...q, t]);
      notify("Added to queue");
    },
    playNext: (t) => {
      if (!queue.length) { setQueue([t]); setOriginal([t]); setIndex(0); return; }
      setQueue((q) => [...q.slice(0, index + 1), t, ...q.slice(index + 1)]);
      notify("Playing next");
    },
    removeFromQueue: (i) => {
      if (i === index) return;
      setQueue((q) => q.filter((_, j) => j !== i));
      if (i < index) setIndex((x) => x - 1);
    },
    setSleepTimer: (m) => {
      setSleepAt(m ? Date.now() + m * 60000 : null);
      notify(m ? `Sleep timer set for ${m} min` : "Sleep timer off");
    },
  };

  return (
    <Ctx.Provider value={value}>
      <Progress.Provider value={progress}>{children}</Progress.Provider>
    </Ctx.Provider>
  );
}

export function usePlayer() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer outside provider");
  return c;
}
export const useProgress = () => useContext(Progress);
