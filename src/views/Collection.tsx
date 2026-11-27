import { useRef, useState, type ReactNode } from "react";
import type { Track } from "../lib/types";
import { usePlayer } from "../lib/player";
import { useLibrary } from "../lib/library";
import { useNav } from "../lib/nav";
import { audius } from "../lib/audius";
import { importFiles } from "../lib/db";
import { TrackList } from "../components/TrackList";
import { Cover } from "../components/Cover";
import { HeartFilled, Offline, Pause, Play, Shuffle, Trash, Upload } from "../components/Icons";
import { useAsync } from "../components/useAsync";
import { fmtTime } from "../lib/format";

function totalTime(tracks: Track[]) {
  const s = tracks.reduce((a, t) => a + (t.duration || 0), 0);
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h} hr ${m} min` : fmtTime(s);
}

function Header({ kind, title, subtitle, art, color, tracks, extra, editable, onTitle }: {
  kind: string; title: string; subtitle: string; art: ReactNode; color: string; tracks: Track[];
  extra?: ReactNode; editable?: boolean; onTitle?: (t: string) => void;
}) {
  const player = usePlayer();
  const ids = new Set(tracks.map((t) => t.id));
  const playingHere = !!player.current && ids.has(player.current.id) && player.isPlaying;
  return (
    <>
      <div className="hero" style={{ ["--hero" as string]: color }}>
        <div className="hero-art">{art}</div>
        <div className="hero-meta">
          <span className="kind">{kind}</span>
          {editable ? (
            <input className="hero-title editable" defaultValue={title} aria-label="Playlist name"
              onBlur={(e) => onTitle?.(e.target.value.trim() || title)}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
          ) : (
            <h1 className="hero-title">{title}</h1>
          )}
          <span className="hero-sub">{subtitle} • {tracks.length} songs{tracks.length ? `, ${totalTime(tracks)}` : ""}</span>
        </div>
      </div>
      <div className="actions" style={{ ["--hero" as string]: color }}>
        <button className="fab big" disabled={!tracks.length} aria-label="Play"
          onClick={() => (playingHere ? player.toggle() : player.playTracks(tracks))}>
          {playingHere ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button className={`icon-btn subtle ${player.shuffle ? "on" : ""}`} aria-label="Shuffle" onClick={player.toggleShuffle}>
          <Shuffle size={28} />
        </button>
        {extra}
      </div>
    </>
  );
}

export function LikedSongs() {
  const lib = useLibrary();
  return (
    <div className="view flush">
      <Header kind="Playlist" title="Liked Songs" subtitle="You" color="#5b21b6" tracks={lib.liked}
        art={<div className="lib-art liked-art hero-cover"><HeartFilled size={72} /></div>} />
      <div className="pad">
        {lib.liked.length ? <TrackList tracks={lib.liked} onRemove={(i) => lib.toggleLike(lib.liked[i])} removeLabel="Remove from Liked Songs" />
          : <Empty title="Songs you like will appear here" text="Save songs by tapping the heart icon." />}
      </div>
    </div>
  );
}

export function LocalLibrary() {
  const lib = useLibrary();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const tracks = await importFiles(files);
      if (tracks.length) lib.addLocalTracks(tracks);
      else lib.notify("No audio files found");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`view flush ${drag ? "dragging" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}>
      <Header kind="Offline" title="Offline Library" subtitle="Saved on this device — plays without internet" color="#0f766e"
        tracks={lib.localTracks}
        art={<div className="lib-art offline-art hero-cover"><Offline size={72} /></div>}
        extra={
          <>
            <input ref={input} type="file" accept="audio/*" multiple hidden onChange={(e) => handle(e.target.files)} />
            <button className="pill" onClick={() => input.current?.click()} disabled={busy}>
              <Upload size={16} /> {busy ? "Importing…" : "Import music"}
            </button>
          </>
        } />
      <div className="pad">
        {lib.localTracks.length ? (
          <TrackList tracks={lib.localTracks} onRemove={(i) => lib.removeLocalTrack(lib.localTracks[i])} removeLabel="Delete from device" />
        ) : (
          <Empty title="Bring your own music"
            text="Drag & drop MP3, M4A, FLAC, WAV or OGG files here (or use Import). They're stored on this device in full original quality and play with no internet at all. Tip: name files “Artist - Title.mp3”." />
        )}
      </div>
    </div>
  );
}

export function PlaylistView({ id }: { id: string }) {
  const lib = useLibrary();
  const { go } = useNav();
  const p = lib.playlists.find((x) => x.id === id);
  if (!p) return <div className="view"><Empty title="Playlist not found" text="It may have been deleted." /></div>;
  return (
    <div className="view flush">
      <Header kind="Playlist" title={p.name} subtitle="You" color="#9d174d" tracks={p.tracks} editable
        onTitle={(name) => lib.renamePlaylist(p.id, name)}
        art={<Cover src={p.tracks[0]?.artworkLarge ?? p.tracks[0]?.artwork} seed={p.id} className="hero-cover" />}
        extra={
          <button className="icon-btn subtle" aria-label="Delete playlist" title="Delete playlist"
            onClick={() => { if (confirm(`Delete “${p.name}”?`)) { lib.deletePlaylist(p.id); go({ name: "library" }); } }}>
            <Trash size={22} />
          </button>
        } />
      <div className="pad">
        {p.tracks.length ? <TrackList tracks={p.tracks} onRemove={(i) => lib.removeFromPlaylist(p.id, i)} removeLabel="Remove from this playlist" />
          : <Empty title="Let’s find something for your playlist" text="Use Search, then “⋯ → Add to playlist”." />}
      </div>
    </div>
  );
}

export function RemotePlaylistView({ playlist }: { playlist: import("../lib/types").RemotePlaylist }) {
  const lib = useLibrary();
  const { data, loading, error } = useAsync(() => audius.playlistTracks(playlist.id), [playlist.id]);
  const tracks = data ?? [];
  return (
    <div className="view flush">
      <Header kind="Public playlist" title={playlist.name} subtitle={playlist.owner} color="#1e3a8a" tracks={tracks}
        art={<Cover src={playlist.artwork} seed={playlist.id} className="hero-cover" />}
        extra={tracks.length > 0 && (
          <button className="pill" onClick={() => lib.createPlaylist(playlist.name, tracks)}>Save to library</button>
        )} />
      <div className="pad">
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="muted">Couldn’t load this playlist.</p>}
        <TrackList tracks={tracks} />
      </div>
    </div>
  );
}

export function GenreView({ genre }: { genre: string }) {
  const [time, setTime] = useState<"week" | "month" | "allTime">("week");
  const { data, loading, error } = useAsync(() => audius.trending(time, genre), [genre, time]);
  const tracks = data ?? [];
  return (
    <div className="view flush">
      <Header kind="Genre" title={genre} subtitle="Top tracks" color="#7c2d12" tracks={tracks}
        art={<Cover src={tracks[0]?.artworkLarge} seed={genre} className="hero-cover" />}
        extra={
          <div className="chips">
            {(["week", "month", "allTime"] as const).map((t) => (
              <button key={t} className={`chip ${time === t ? "on" : ""}`} onClick={() => setTime(t)}>
                {t === "week" ? "This week" : t === "month" ? "This month" : "All time"}
              </button>
            ))}
          </div>
        } />
      <div className="pad">
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="muted">Couldn’t load {genre} right now.</p>}
        <TrackList tracks={tracks} showPlays />
      </div>
    </div>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
