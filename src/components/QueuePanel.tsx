import { usePlayer } from "../lib/player";
import { Cover } from "./Cover";
import { Close } from "./Icons";
import { Equalizer } from "./TrackList";

export function QueuePanel({ onClose }: { onClose: () => void }) {
  const p = usePlayer();
  const upcoming = p.queue.map((t, i) => ({ t, i })).filter(({ i }) => i > p.index);

  return (
    <aside className="panel queue-panel">
      <div className="qp-head">
        <h3>Queue</h3>
        <button className="icon-btn subtle" aria-label="Close queue" onClick={onClose}><Close size={18} /></button>
      </div>
      {p.current && (
        <>
          <div className="qp-label">Now playing</div>
          <div className="qp-item active">
            <Cover src={p.current.artwork} seed={p.current.id} size={44} />
            <div className="lib-meta"><span className="t">{p.current.title}</span><span className="a">{p.current.artist}</span></div>
            {p.isPlaying && <Equalizer />}
          </div>
        </>
      )}
      <div className="qp-label">Next up {upcoming.length ? `• ${upcoming.length}` : ""}</div>
      {!upcoming.length && <p className="muted small">Nothing queued. Add songs with “⋯ → Add to queue”.</p>}
      <div className="qp-list">
        {upcoming.map(({ t, i }) => (
          <div key={`${t.id}-${i}`} className="qp-item" onDoubleClick={() => p.jumpTo(i)}>
            <Cover src={t.artwork} seed={t.id} size={44} />
            <div className="lib-meta" onClick={() => p.jumpTo(i)}><span className="t">{t.title}</span><span className="a">{t.artist}</span></div>
            <button className="icon-btn subtle" aria-label="Remove from queue" onClick={() => p.removeFromQueue(i)}><Close size={14} /></button>
          </div>
        ))}
      </div>
    </aside>
  );
}
