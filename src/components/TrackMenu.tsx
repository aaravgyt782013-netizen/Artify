import { useEffect, useRef, useState } from "react";
import type { Track } from "../lib/types";
import { useLibrary } from "../lib/library";
import { usePlayer } from "../lib/player";
import { More } from "./Icons";

export function TrackMenu({ track, onRemove, removeLabel }: { track: Track; onRemove?: () => void; removeLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const lib = useLibrary();
  const player = usePlayer();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) { setOpen(false); setSub(false); } };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const act = (fn: () => void) => () => { fn(); setOpen(false); setSub(false); };

  return (
    <div className="menu-wrap" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button className="icon-btn subtle" aria-label="More options" onClick={() => setOpen((o) => !o)}>
        <More size={18} />
      </button>
      {open && (
        <div className="menu">
          <button onClick={act(() => player.playNext(track))}>Play next</button>
          <button onClick={act(() => player.addToQueue(track))}>Add to queue</button>
          <button onClick={act(() => lib.toggleLike(track))}>{lib.isLiked(track.id) ? "Remove from Liked Songs" : "Save to Liked Songs"}</button>
          {track.source === "audius" && (lib.isDownloaded(track.id) ? (
            <button onClick={act(() => lib.removeDownload(track))}>Remove download</button>
          ) : (
            <button disabled={!track.downloadable || lib.downloading.has(track.id)}
              title={track.downloadable ? "" : "The artist hasn't enabled downloads"}
              onClick={act(() => lib.download(track))}>
              {lib.downloading.has(track.id) ? "Downloading…" : track.downloadable ? "Download for offline" : "Download unavailable"}
            </button>
          ))}
          <button onClick={() => setSub((s) => !s)}>Add to playlist ›</button>
          {sub && (
            <div className="submenu">
              <button onClick={act(() => lib.createPlaylist(undefined, [track]))}>+ New playlist</button>
              {lib.playlists.map((p) => (
                <button key={p.id} onClick={act(() => lib.addToPlaylist(p.id, track))}>{p.name}</button>
              ))}
            </div>
          )}
          {track.source === "audius" && (
            <button onClick={act(() => {
              navigator.clipboard?.writeText(`${track.title} — ${track.artist}`);
              lib.notify("Copied song info");
            })}>Share</button>
          )}
          {onRemove && <button className="danger" onClick={act(onRemove)}>{removeLabel ?? "Remove"}</button>}
        </div>
      )}
    </div>
  );
}
