import { Cover } from "./Cover";
import { Play } from "./Icons";

interface Props {
  title: string;
  subtitle?: string;
  artwork?: string;
  seed: string;
  round?: boolean;
  onOpen?: () => void;
  onPlay?: () => void;
}

export function Card({ title, subtitle, artwork, seed, round, onOpen, onPlay }: Props) {
  return (
    <div className="card" onClick={onOpen ?? onPlay} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && (onOpen ?? onPlay)?.()}>
      <div className="card-art">
        <Cover src={artwork} seed={seed} round={round} />
        {onPlay && (
          <button className="fab" aria-label={`Play ${title}`} onClick={(e) => { e.stopPropagation(); onPlay(); }}>
            <Play size={22} />
          </button>
        )}
      </div>
      <div className="card-title">{title}</div>
      {subtitle && <div className="card-sub">{subtitle}</div>}
    </div>
  );
}

export function Shelf({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="shelf">
      <div className="shelf-head">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="shelf-row">{children}</div>
    </section>
  );
}
