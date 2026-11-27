import { useState } from "react";
import { usePlayer, useProgress } from "../lib/player";
import { useLibrary } from "../lib/library";
import { fmtTime } from "../lib/format";
import { Cover } from "./Cover";
import * as I from "./Icons";

function Slider({ value, max, buffered, onChange, label }: { value: number; max: number; buffered?: number; onChange: (v: number) => void; label: string }) {
  const pct = max ? (value / max) * 100 : 0;
  const bpct = max && buffered ? (buffered / max) * 100 : 0;
  return (
    <div className="slider" style={{ ["--p" as string]: `${pct}%`, ["--b" as string]: `${bpct}%` }}>
      <input type="range" aria-label={label} min={0} max={max || 1} step={0.01} value={value}
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function PlayerBar({ queueOpen, onToggleQueue }: { queueOpen: boolean; onToggleQueue: () => void }) {
  const p = usePlayer();
  const { time, duration, buffered } = useProgress();
  const lib = useLibrary();
  const [scrub, setScrub] = useState<number | null>(null);
  const [sleepOpen, setSleepOpen] = useState(false);
  const t = p.current;
  const dur = duration || t?.duration || 0;

  return (
    <footer className="playerbar">
      <div className="pb-left">
        {t ? (
          <>
            <Cover src={t.artwork} seed={t.id} size={56} className={p.isPlaying ? "spin-glow" : ""} />
            <div className="pb-meta">
              <span className="t">{t.title}</span>
              <span className="a">{t.artist}</span>
            </div>
            <button className={`icon-btn subtle ${lib.isLiked(t.id) ? "liked" : ""}`} aria-label="Like" onClick={() => lib.toggleLike(t)}>
              {lib.isLiked(t.id) ? <I.HeartFilled size={18} /> : <I.Heart size={18} />}
            </button>
          </>
        ) : (
          <span className="pb-empty">Pick something to play ✨</span>
        )}
      </div>

      <div className="pb-center">
        <div className="pb-controls">
          <button className={`icon-btn subtle ${p.shuffle ? "on" : ""}`} aria-label="Shuffle" title="Shuffle (S)" onClick={p.toggleShuffle}>
            <I.Shuffle size={18} />
          </button>
          <button className="icon-btn" aria-label="Previous" onClick={p.prev}><I.Prev size={20} /></button>
          <button className={`play-btn ${p.buffering && p.isPlaying ? "loading" : ""}`} aria-label={p.isPlaying ? "Pause" : "Play"} onClick={p.toggle} disabled={!t}>
            {p.isPlaying ? <I.Pause size={18} /> : <I.Play size={18} />}
          </button>
          <button className="icon-btn" aria-label="Next" onClick={p.next}><I.Next size={20} /></button>
          <button className={`icon-btn subtle ${p.repeat !== "off" ? "on" : ""}`} aria-label={`Repeat ${p.repeat}`} title="Repeat (R)" onClick={p.cycleRepeat}>
            <I.Repeat size={18} />
            {p.repeat === "one" && <span className="badge-1">1</span>}
          </button>
        </div>
        <div className="pb-progress">
          <span className="time">{fmtTime(scrub ?? time)}</span>
          <Slider label="Seek" value={scrub ?? time} max={dur} buffered={buffered}
            onChange={(v) => { setScrub(v); p.seek(v); setTimeout(() => setScrub(null), 0); }} />
          <span className="time">{fmtTime(dur)}</span>
        </div>
        {p.error && <div className="pb-error">{p.error}</div>}
      </div>

      <div className="pb-right">
        <div className="menu-wrap">
          <button className={`icon-btn subtle ${p.sleepAt ? "on" : ""}`} aria-label="Sleep timer" title="Sleep timer" onClick={() => setSleepOpen((o) => !o)}>
            <I.Moon size={18} />
          </button>
          {sleepOpen && (
            <div className="menu up">
              {[5, 15, 30, 45, 60].map((m) => (
                <button key={m} onClick={() => { p.setSleepTimer(m); setSleepOpen(false); }}>{m} minutes</button>
              ))}
              {p.sleepAt && <button className="danger" onClick={() => { p.setSleepTimer(null); setSleepOpen(false); }}>Turn off</button>}
            </div>
          )}
        </div>
        <button className={`icon-btn subtle ${queueOpen ? "on" : ""}`} aria-label="Queue" title="Queue (Q)" onClick={onToggleQueue}>
          <I.Queue size={18} />
        </button>
        <button className="icon-btn subtle" aria-label={p.muted ? "Unmute" : "Mute"} onClick={p.toggleMute}>
          {p.muted || p.volume === 0 ? <I.Mute size={18} /> : <I.Volume size={18} />}
        </button>
        <div className="vol">
          <Slider label="Volume" value={p.muted ? 0 : p.volume} max={1} onChange={p.setVolume} />
        </div>
      </div>
    </footer>
  );
}
