export type TrackSource = "audius" | "local";

export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  artworkLarge?: string;
  duration: number; // seconds
  source: TrackSource;
  genre?: string;
  plays?: number;
  localId?: string; // IndexedDB key for local files
  addedAt?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: number;
}

export interface RemotePlaylist {
  id: string;
  name: string;
  owner: string;
  artwork?: string;
  trackCount: number;
}

export type View =
  | { name: "home" }
  | { name: "search"; query?: string }
  | { name: "library" }
  | { name: "liked" }
  | { name: "local" }
  | { name: "playlist"; id: string }
  | { name: "remotePlaylist"; playlist: RemotePlaylist }
  | { name: "genre"; genre: string };
