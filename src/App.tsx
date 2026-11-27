import { useEffect, useState } from "react";
import { useNav } from "./lib/nav";
import { usePlayer } from "./lib/player";
import { useLibrary } from "./lib/library";
import { Sidebar } from "./components/Sidebar";
import { PlayerBar } from "./components/PlayerBar";
import { QueuePanel } from "./components/QueuePanel";
import { Back, Forward, Search as SearchIcon, Home as HomeIcon, Library as LibIcon } from "./components/Icons";
import { Home } from "./views/Home";
import { Search } from "./views/Search";
import { LibraryView } from "./views/Library";
import { GenreView, LikedSongs, LocalLibrary, PlaylistView, RemotePlaylistView } from "./views/Collection";

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

export default function App() {
  const nav = useNav();
  const player = usePlayer();
  const lib = useLibrary();
  const online = useOnline();
  const [query, setQuery] = useState("");
  const [queueOpen, setQueueOpen] = useState(false);
  const { view } = nav;

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") { e.preventDefault(); player.toggle(); }
      else if (e.key === "ArrowRight" && e.shiftKey) player.next();
      else if (e.key === "ArrowLeft" && e.shiftKey) player.prev();
      else if (e.key === "ArrowUp") { e.preventDefault(); player.setVolume(Math.min(1, player.volume + 0.05)); }
      else if (e.key === "ArrowDown") { e.preventDefault(); player.setVolume(Math.max(0, player.volume - 0.05)); }
      else if (e.key.toLowerCase() === "m") player.toggleMute();
      else if (e.key.toLowerCase() === "s") player.toggleShuffle();
      else if (e.key.toLowerCase() === "r") player.cycleRepeat();
      else if (e.key.toLowerCase() === "q") setQueueOpen((o) => !o);
      else if (e.key === "/") { e.preventDefault(); nav.go({ name: "search" }); setTimeout(() => document.getElementById("search")?.focus(), 0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, nav]);

  let content;
  switch (view.name) {
    case "home": content = <Home />; break;
    case "search": content = <Search query={query} />; break;
    case "library": content = <LibraryView />; break;
    case "liked": content = <LikedSongs />; break;
    case "local": content = <LocalLibrary />; break;
    case "playlist": content = <PlaylistView id={view.id} />; break;
    case "remotePlaylist": content = <RemotePlaylistView playlist={view.playlist} />; break;
    case "genre": content = <GenreView genre={view.genre} />; break;
  }

  const viewKey = JSON.stringify(view.name === "remotePlaylist" ? { n: view.name, id: view.playlist.id } : view);

  return (
    <div className={`app ${queueOpen ? "with-queue" : ""}`}>
      <Sidebar />
      <main className="panel main">
        <header className="topbar">
          <div className="nav-arrows">
            <button className="round-btn" aria-label="Go back" disabled={!nav.canBack} onClick={nav.back}><Back size={18} /></button>
            <button className="round-btn" aria-label="Go forward" disabled={!nav.canForward} onClick={nav.forward}><Forward size={18} /></button>
          </div>
          {view.name === "search" && (
            <label className="searchbox">
              <SearchIcon size={18} />
              <input id="search" autoFocus placeholder="What do you want to play?" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          )}
          <div className="spacer" />
          {!online && <span className="offline-pill">Offline — your library still plays</span>}
        </header>
        <div className="scroll" key={viewKey}>{content}</div>
      </main>
      {queueOpen && <QueuePanel onClose={() => setQueueOpen(false)} />}
      <PlayerBar queueOpen={queueOpen} onToggleQueue={() => setQueueOpen((o) => !o)} />

      <nav className="mobile-nav">
        <button className={view.name === "home" ? "active" : ""} onClick={() => nav.go({ name: "home" })}><HomeIcon size={22} />Home</button>
        <button className={view.name === "search" ? "active" : ""} onClick={() => nav.go({ name: "search" })}><SearchIcon size={22} />Search</button>
        <button className={view.name === "library" ? "active" : ""} onClick={() => nav.go({ name: "library" })}><LibIcon size={22} />Library</button>
      </nav>

      {lib.toast && <div className="toast" role="status">{lib.toast}</div>}
    </div>
  );
}
