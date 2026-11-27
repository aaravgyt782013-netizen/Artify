import { useNav } from "../lib/nav";
import { useLibrary } from "../lib/library";
import { usePlayer } from "../lib/player";
import { Logo } from "./Logo";
import { Cover } from "./Cover";
import { HeartFilled, Home, Library, Offline, Plus, Search } from "./Icons";
import { Equalizer } from "./TrackList";

export function Sidebar() {
  const { view, go } = useNav();
  const lib = useLibrary();
  const player = usePlayer();

  const playingFrom = (ids: string[]) => player.isPlaying && player.current && ids.includes(player.current.id);

  return (
    <aside className="sidebar">
      <div className="panel nav-panel">
        <Logo />
        <button className={`nav-item ${view.name === "home" ? "active" : ""}`} onClick={() => go({ name: "home" })}>
          <Home size={24} /> Home
        </button>
        <button className={`nav-item ${view.name === "search" ? "active" : ""}`} onClick={() => go({ name: "search" })}>
          <Search size={24} /> Search
        </button>
      </div>

      <div className="panel lib-panel">
        <div className="lib-head">
          <button className={`nav-item ${view.name === "library" ? "active" : ""}`} onClick={() => go({ name: "library" })}>
            <Library size={24} /> Your Library
          </button>
          <button className="icon-btn subtle" aria-label="Create playlist" title="Create playlist"
            onClick={() => { const p = lib.createPlaylist(); go({ name: "playlist", id: p.id }); }}>
            <Plus size={20} />
          </button>
        </div>
        <div className="lib-list">
          <button className={`lib-item ${view.name === "liked" ? "active" : ""}`} onClick={() => go({ name: "liked" })}>
            <div className="lib-art liked-art"><HeartFilled size={18} /></div>
            <div className="lib-meta">
              <span className="t">Liked Songs</span>
              <span className="a">Playlist • {lib.liked.length} songs</span>
            </div>
            {playingFrom(lib.liked.map((t) => t.id)) && <Equalizer />}
          </button>
          <button className={`lib-item ${view.name === "local" ? "active" : ""}`} onClick={() => go({ name: "local" })}>
            <div className="lib-art offline-art"><Offline size={20} /></div>
            <div className="lib-meta">
              <span className="t">Offline Library</span>
              <span className="a">On this device • {lib.localTracks.length + lib.downloads.length} songs</span>
            </div>
          </button>
          {lib.playlists.map((p) => (
            <button key={p.id}
              className={`lib-item ${view.name === "playlist" && view.id === p.id ? "active" : ""}`}
              onClick={() => go({ name: "playlist", id: p.id })}>
              <Cover src={p.tracks[0]?.artwork} seed={p.id} size={44} />
              <div className="lib-meta">
                <span className="t">{p.name}</span>
                <span className="a">Playlist • {p.tracks.length} songs</span>
              </div>
              {playingFrom(p.tracks.map((t) => t.id)) && <Equalizer />}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
