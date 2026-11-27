// Audius is an open, artist-owned music platform with a free public API.
// Artists upload their own tracks and permit streaming via the API, so every
// track here is fully licensed, full-length, and new uploads arrive every day.
import type { RemotePlaylist, Track } from "./types";

const APP = "ARTIFY";
const BASE = "https://api.audius.co/v1";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapTrack(t: any): Track {
  return {
    id: `audius:${t.id}`,
    title: t.title,
    artist: t.user?.name ?? "Unknown artist",
    artwork: t.artwork?.["480x480"] ?? t.artwork?.["150x150"],
    artworkLarge: t.artwork?.["1000x1000"] ?? t.artwork?.["480x480"],
    duration: t.duration ?? 0,
    source: "audius",
    genre: t.genre,
    plays: t.play_count,
  };
}

function mapPlaylist(p: any): RemotePlaylist {
  return {
    id: p.id,
    name: p.playlist_name,
    owner: p.user?.name ?? "",
    artwork: p.artwork?.["480x480"] ?? p.artwork?.["150x150"],
    trackCount: p.track_count ?? 0,
  };
}

async function get<T = any>(path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ ...params, app_name: APP });
  const res = await fetch(`${BASE}${path}?${qs}`);
  if (!res.ok) throw new Error(`Audius ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

// Simple day-scoped cache so the catalog refreshes once per day but stays snappy.
function today() {
  return new Date().toISOString().slice(0, 10);
}
async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const k = `artify:cache:${key}`;
  try {
    const raw = localStorage.getItem(k);
    if (raw) {
      const { day, data } = JSON.parse(raw);
      if (day === today()) return data as T;
    }
  } catch { /* ignore */ }
  try {
    const data = await fn();
    try { localStorage.setItem(k, JSON.stringify({ day: today(), data })); } catch { /* quota */ }
    return data;
  } catch (err) {
    // Offline? fall back to yesterday's cache if we have one.
    const raw = localStorage.getItem(k);
    if (raw) return JSON.parse(raw).data as T;
    throw err;
  }
}

export const audius = {
  streamUrl(track: Track) {
    const rawId = track.id.replace(/^audius:/, "");
    return `${BASE}/tracks/${rawId}/stream?app_name=${APP}`;
  },
  trending(time: "week" | "month" | "year" | "allTime" = "week", genre?: string) {
    return cached(`trending:${time}:${genre ?? "all"}`, async () => {
      const params: Record<string, string> = { time };
      if (genre) params.genre = genre;
      return (await get<any[]>("/tracks/trending", params)).map(mapTrack);
    });
  },
  underground() {
    return cached("underground", async () =>
      (await get<any[]>("/tracks/trending/underground")).map(mapTrack)
    );
  },
  trendingPlaylists() {
    return cached("playlists:week", async () =>
      (await get<any[]>("/playlists/trending", { time: "week" })).map(mapPlaylist)
    );
  },
  async playlistTracks(id: string) {
    return cached(`playlist:${id}`, async () =>
      (await get<any[]>(`/playlists/${id}/tracks`)).map(mapTrack)
    );
  },
  async search(query: string) {
    if (!query.trim()) return [];
    return (await get<any[]>("/tracks/search", { query })).map(mapTrack);
  },
  async searchPlaylists(query: string) {
    if (!query.trim()) return [];
    return (await get<any[]>("/playlists/search", { query })).map(mapPlaylist);
  },
};

export const GENRES: { name: string; color: string }[] = [
  { name: "Electronic", color: "#7c3aed" },
  { name: "Hip-Hop/Rap", color: "#e11d48" },
  { name: "Pop", color: "#db2777" },
  { name: "Lo-Fi", color: "#0d9488" },
  { name: "House", color: "#2563eb" },
  { name: "Alternative", color: "#ca8a04" },
  { name: "R&B/Soul", color: "#9333ea" },
  { name: "Rock", color: "#b91c1c" },
  { name: "Ambient", color: "#0891b2" },
  { name: "Jazz", color: "#c2410c" },
  { name: "Latin", color: "#16a34a" },
  { name: "Techno", color: "#4f46e5" },
  { name: "Acoustic", color: "#a16207" },
  { name: "Classical", color: "#475569" },
  { name: "Dubstep", color: "#65a30d" },
  { name: "Trap", color: "#be123c" },
];
