import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Playlist, Track } from "./types";
import { fileDb } from "./db";

function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(`artify:${key}`);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(`artify:${key}`, JSON.stringify(value)); } catch { /* quota */ }
  }, [key, value]);
  return [value, setValue] as const;
}

interface LibraryCtx {
  liked: Track[];
  isLiked: (id: string) => boolean;
  toggleLike: (t: Track) => void;
  playlists: Playlist[];
  createPlaylist: (name?: string, tracks?: Track[]) => Playlist;
  renamePlaylist: (id: string, name: string, description?: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (id: string, t: Track) => void;
  removeFromPlaylist: (id: string, index: number) => void;
  localTracks: Track[];
  addLocalTracks: (t: Track[]) => void;
  removeLocalTrack: (t: Track) => void;
  recent: Track[];
  pushRecent: (t: Track) => void;
  toast: string | null;
  notify: (msg: string) => void;
}

const Ctx = createContext<LibraryCtx | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = usePersisted<Track[]>("liked", []);
  const [playlists, setPlaylists] = usePersisted<Playlist[]>("playlists", []);
  const [localTracks, setLocalTracks] = usePersisted<Track[]>("local", []);
  const [recent, setRecent] = usePersisted<Track[]>("recent", []);
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout((notify as unknown as { t?: number }).t);
    (notify as unknown as { t?: number }).t = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const likedIds = useMemo(() => new Set(liked.map((t) => t.id)), [liked]);

  const value: LibraryCtx = {
    liked,
    isLiked: (id) => likedIds.has(id),
    toggleLike: (t) => {
      if (likedIds.has(t.id)) {
        setLiked((l) => l.filter((x) => x.id !== t.id));
        notify("Removed from Liked Songs");
      } else {
        setLiked((l) => [{ ...t, addedAt: Date.now() }, ...l]);
        notify("Added to Liked Songs");
      }
    },
    playlists,
    createPlaylist: (name, tracks = []) => {
      const p: Playlist = {
        id: crypto.randomUUID(),
        name: name ?? `My Playlist #${playlists.length + 1}`,
        tracks,
        createdAt: Date.now(),
      };
      setPlaylists((ps) => [p, ...ps]);
      notify(`Created “${p.name}”`);
      return p;
    },
    renamePlaylist: (id, name, description) =>
      setPlaylists((ps) => ps.map((p) => (p.id === id ? { ...p, name, description } : p))),
    deletePlaylist: (id) => {
      setPlaylists((ps) => ps.filter((p) => p.id !== id));
      notify("Playlist deleted");
    },
    addToPlaylist: (id, t) => {
      setPlaylists((ps) => ps.map((p) => (p.id === id ? { ...p, tracks: [...p.tracks, { ...t, addedAt: Date.now() }] } : p)));
      notify(`Added to ${playlists.find((p) => p.id === id)?.name ?? "playlist"}`);
    },
    removeFromPlaylist: (id, index) =>
      setPlaylists((ps) => ps.map((p) => (p.id === id ? { ...p, tracks: p.tracks.filter((_, i) => i !== index) } : p))),
    localTracks,
    addLocalTracks: (t) => {
      setLocalTracks((l) => [...t, ...l]);
      notify(`Imported ${t.length} song${t.length === 1 ? "" : "s"} — available offline`);
    },
    removeLocalTrack: (t) => {
      if (t.localId) fileDb.remove(t.localId).catch(() => {});
      setLocalTracks((l) => l.filter((x) => x.id !== t.id));
      setLiked((l) => l.filter((x) => x.id !== t.id));
      setPlaylists((ps) => ps.map((p) => ({ ...p, tracks: p.tracks.filter((x) => x.id !== t.id) })));
    },
    recent,
    pushRecent: (t) => setRecent((r) => [t, ...r.filter((x) => x.id !== t.id)].slice(0, 30)),
    toast,
    notify,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLibrary() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLibrary outside provider");
  return c;
}
