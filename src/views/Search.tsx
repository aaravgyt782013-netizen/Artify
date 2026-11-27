import { useEffect, useState } from "react";
import { audius, GENRES } from "../lib/audius";
import { useNav } from "../lib/nav";
import { usePlayer } from "../lib/player";
import { useLibrary } from "../lib/library";
import type { RemotePlaylist, Track } from "../lib/types";
import { TrackList } from "../components/TrackList";
import { Card, Shelf } from "../components/Card";
import { Cover } from "../components/Cover";
import { Play } from "../components/Icons";

export function Search({ query }: { query: string }) {
  const { go } = useNav();
  const player = usePlayer();
  const lib = useLibrary();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [lists, setLists] = useState<RemotePlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) { setTracks([]); setLists([]); return; }
    let alive = true;
    setLoading(true);
    setError(null);
    const id = setTimeout(() => {
      Promise.all([audius.search(query), audius.searchPlaylists(query).catch(() => [])])
        .then(([t, p]) => { if (alive) { setTracks(t); setLists(p); } })
        .catch(() => alive && setError("Search needs an internet connection."))
        .finally(() => alive && setLoading(false));
    }, 300);
    return () => { alive = false; clearTimeout(id); };
  }, [query]);

  const q = query.toLowerCase();
  const localHits = q ? lib.localTracks.filter((t) => `${t.title} ${t.artist}`.toLowerCase().includes(q)) : [];

  if (!query.trim()) {
    return (
      <div className="view">
        <h2 className="section-title">Browse all</h2>
        <div className="genre-grid">
          {GENRES.map((g) => (
            <button key={g.name} className="genre-tile" style={{ background: g.color }} onClick={() => go({ name: "genre", genre: g.name })}>
              <span>{g.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const top = tracks[0];
  return (
    <div className="view">
      {loading && !tracks.length && <p className="muted">Searching…</p>}
      {error && <p className="muted">{error}</p>}
      {localHits.length > 0 && (
        <>
          <h2 className="section-title">In your offline library</h2>
          <TrackList tracks={localHits} compact />
        </>
      )}
      {top && (
        <div className="search-top">
          <div>
            <h2 className="section-title">Top result</h2>
            <div className="top-card" onClick={() => player.playTracks(tracks, 0)}>
              <Cover src={top.artwork} seed={top.id} size={96} />
              <div className="top-title">{top.title}</div>
              <div className="muted">Song • {top.artist}</div>
              <button className="fab" aria-label="Play top result"><Play size={22} /></button>
            </div>
          </div>
          <div className="search-songs">
            <h2 className="section-title">Songs</h2>
            <TrackList tracks={tracks.slice(0, 5)} compact />
          </div>
        </div>
      )}
      {tracks.length > 5 && (
        <>
          <h2 className="section-title">More songs</h2>
          <TrackList tracks={tracks.slice(5)} showPlays />
        </>
      )}
      {lists.length > 0 && (
        <Shelf title="Playlists">
          {lists.slice(0, 10).map((p) => (
            <Card key={p.id} title={p.name} subtitle={`By ${p.owner}`} artwork={p.artwork} seed={p.id}
              onOpen={() => go({ name: "remotePlaylist", playlist: p })} />
          ))}
        </Shelf>
      )}
      {!loading && !error && !tracks.length && !localHits.length && <p className="muted">No results for “{query}”.</p>}
    </div>
  );
}
