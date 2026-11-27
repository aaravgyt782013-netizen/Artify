import { audius } from "../lib/audius";
import { greeting } from "../lib/format";
import { useLibrary } from "../lib/library";
import { useNav } from "../lib/nav";
import { usePlayer } from "../lib/player";
import { Card, Shelf } from "../components/Card";
import { Cover } from "../components/Cover";
import { HeartFilled, Offline, Play } from "../components/Icons";
import { useAsync } from "../components/useAsync";
import type { Track } from "../lib/types";

function SkeletonRow() {
  return <div className="shelf-row">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="card skeleton"><div className="card-art" /><div className="sk-line" /><div className="sk-line short" /></div>)}</div>;
}

function TrackShelf({ title, tracks, loading, error }: { title: string; tracks: Track[] | null; loading: boolean; error: string | null }) {
  const player = usePlayer();
  return (
    <Shelf title={title}>
      {loading && !tracks ? <SkeletonRow /> : error && !tracks ? <p className="muted">Couldn’t load right now — check your connection.</p> :
        (tracks ?? []).slice(0, 12).map((t, i) => (
          <Card key={t.id} title={t.title} subtitle={t.artist} artwork={t.artwork} seed={t.id}
            onPlay={() => player.playTracks(tracks!, i)} />
        ))}
    </Shelf>
  );
}

export function Home() {
  const { go } = useNav();
  const lib = useLibrary();
  const player = usePlayer();
  const trending = useAsync(() => audius.trending("week"), []);
  const fresh = useAsync(() => audius.underground(), []);
  const allTime = useAsync(() => audius.trending("allTime"), []);
  const playlists = useAsync(() => audius.trendingPlaylists(), []);

  const quick = [
    { key: "liked", label: "Liked Songs", art: <div className="lib-art liked-art"><HeartFilled size={20} /></div>, tracks: lib.liked, open: () => go({ name: "liked" }) },
    { key: "local", label: "Offline Library", art: <div className="lib-art offline-art"><Offline size={20} /></div>, tracks: lib.localTracks, open: () => go({ name: "local" }) },
    ...lib.playlists.slice(0, 4).map((p) => ({
      key: p.id, label: p.name, art: <Cover src={p.tracks[0]?.artwork} seed={p.id} size={64} />, tracks: p.tracks, open: () => go({ name: "playlist", id: p.id }),
    })),
  ];

  return (
    <div className="view home">
      <h1 className="greeting">{greeting()}</h1>
      <div className="quick-grid">
        {quick.map((q) => (
          <div key={q.key} className="quick" onClick={q.open} role="button" tabIndex={0}>
            {q.art}
            <span>{q.label}</span>
            {q.tracks.length > 0 && (
              <button className="fab small" aria-label={`Play ${q.label}`} onClick={(e) => { e.stopPropagation(); player.playTracks(q.tracks); }}>
                <Play size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      {lib.recent.length > 0 && (
        <Shelf title="Recently played">
          {lib.recent.slice(0, 12).map((t, i) => (
            <Card key={t.id} title={t.title} subtitle={t.artist} artwork={t.artwork} seed={t.id}
              onPlay={() => player.playTracks(lib.recent, i)} />
          ))}
        </Shelf>
      )}

      <TrackShelf title="Trending this week" tracks={trending.data} loading={trending.loading} error={trending.error} />
      <TrackShelf title="Fresh finds — rising artists" tracks={fresh.data} loading={fresh.loading} error={fresh.error} />

      <Shelf title="Popular playlists">
        {playlists.loading && !playlists.data ? <SkeletonRow /> :
          (playlists.data ?? []).slice(0, 12).map((p) => (
            <Card key={p.id} title={p.name} subtitle={`By ${p.owner}`} artwork={p.artwork} seed={p.id}
              onOpen={() => go({ name: "remotePlaylist", playlist: p })}
              onPlay={async () => player.playTracks(await audius.playlistTracks(p.id))} />
          ))}
      </Shelf>

      <TrackShelf title="All-time hits" tracks={allTime.data} loading={allTime.loading} error={allTime.error} />

      <p className="footnote">
        Music on Artify is streamed from <a href="https://audius.co" target="_blank" rel="noreferrer">Audius</a>, where artists upload and share their own tracks.
        Charts refresh every day.
      </p>
    </div>
  );
}
