import { useState } from "react";
import { useLibrary } from "../lib/library";
import { useNav } from "../lib/nav";
import { usePlayer } from "../lib/player";
import { Card } from "../components/Card";

export function LibraryView() {
  const lib = useLibrary();
  const { go } = useNav();
  const player = usePlayer();
  const [filter, setFilter] = useState<"all" | "playlists" | "offline">("all");

  return (
    <div className="view">
      <div className="lib-top">
        <h1>Your Library</h1>
        <button className="pill" onClick={() => { const p = lib.createPlaylist(); go({ name: "playlist", id: p.id }); }}>+ Create playlist</button>
      </div>
      <div className="chips">
        {(["all", "playlists", "offline"] as const).map((f) => (
          <button key={f} className={`chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "playlists" ? "Playlists" : "Offline"}
          </button>
        ))}
      </div>
      <div className="grid">
        {filter !== "offline" && (
          <Card title="Liked Songs" subtitle={`${lib.liked.length} songs`} seed="liked-songs"
            artwork={lib.liked[0]?.artwork} onOpen={() => go({ name: "liked" })}
            onPlay={lib.liked.length ? () => player.playTracks(lib.liked) : undefined} />
        )}
        {filter !== "playlists" && (
          <Card title="Offline Library" subtitle={`${lib.localTracks.length} songs on this device`} seed="offline-lib"
            onOpen={() => go({ name: "local" })}
            onPlay={lib.localTracks.length ? () => player.playTracks(lib.localTracks) : undefined} />
        )}
        {filter !== "offline" && lib.playlists.map((p) => (
          <Card key={p.id} title={p.name} subtitle={`${p.tracks.length} songs`} seed={p.id} artwork={p.tracks[0]?.artwork}
            onOpen={() => go({ name: "playlist", id: p.id })}
            onPlay={p.tracks.length ? () => player.playTracks(p.tracks) : undefined} />
        ))}
      </div>
    </div>
  );
}
