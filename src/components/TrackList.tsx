import type { Track } from "../lib/types";
import { usePlayer } from "../lib/player";
import { useLibrary } from "../lib/library";
import { fmtCount, fmtTime } from "../lib/format";
import { Cover } from "./Cover";
import { Clock, Heart, HeartFilled, Offline, Pause, Play } from "./Icons";
import { TrackMenu } from "./TrackMenu";

interface Props {
  tracks: Track[];
  showPlays?: boolean;
  onRemove?: (index: number) => void;
  removeLabel?: string;
  compact?: boolean;
}

export function Equalizer() {
  return <span className="eq"><i /><i /><i /></span>;
}

export function TrackList({ tracks, showPlays, onRemove, removeLabel, compact }: Props) {
  const player = usePlayer();
  const lib = useLibrary();

  if (!tracks.length) return null;

  return (
    <div className={`tracklist ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="tl-row tl-head">
          <span className="tl-num">#</span>
          <span>Title</span>
          <span className="tl-genre">{showPlays ? "Plays" : "Genre"}</span>
          <span />
          <span className="tl-dur"><Clock size={16} /></span>
          <span />
        </div>
      )}
      {tracks.map((t, i) => {
        const active = player.current?.id === t.id;
        const liked = lib.isLiked(t.id);
        return (
          <div
            key={`${t.id}-${i}`}
            className={`tl-row ${active ? "active" : ""}`}
            onDoubleClick={() => player.playTracks(tracks, i)}
          >
            <span className="tl-num">
              <span className="num">{active && player.isPlaying ? <Equalizer /> : i + 1}</span>
              <button
                className="icon-btn play-mini"
                aria-label={active && player.isPlaying ? "Pause" : `Play ${t.title}`}
                onClick={() => (active ? player.toggle() : player.playTracks(tracks, i))}
              >
                {active && player.isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </span>
            <span className="tl-title">
              <Cover src={t.artwork} seed={t.id} size={40} />
              <span className="tl-text">
                <span className="t">{t.title}</span>
                <span className="a">
                  {(t.source === "local" || lib.isDownloaded(t.id)) && <Offline size={12} className="offline-badge" />}
                  {t.artist}
                </span>
              </span>
            </span>
            <span className="tl-genre">{showPlays ? fmtCount(t.plays) : t.genre ?? (t.source === "local" ? "Offline" : "")}</span>
            <span className="tl-like">
              <button className={`icon-btn subtle ${liked ? "liked" : ""}`} aria-label="Like" onClick={() => lib.toggleLike(t)}>
                {liked ? <HeartFilled size={16} /> : <Heart size={16} />}
              </button>
            </span>
            <span className="tl-dur">{fmtTime(t.duration)}</span>
            <span className="tl-more">
              <TrackMenu track={t} onRemove={onRemove ? () => onRemove(i) : undefined} removeLabel={removeLabel} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
