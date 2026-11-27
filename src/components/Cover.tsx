import { Music } from "./Icons";

const PALETTE = ["#7c3aed", "#db2777", "#0d9488", "#2563eb", "#ca8a04", "#e11d48", "#9333ea", "#16a34a"];
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Cover({ src, seed, size, round, className = "" }: { src?: string; seed: string; size?: number; round?: boolean; className?: string }) {
  const style = { width: size, height: size, borderRadius: round ? "50%" : undefined };
  if (src) return <img className={`cover ${className}`} src={src} alt="" loading="lazy" style={style} />;
  const c1 = PALETTE[hash(seed) % PALETTE.length];
  const c2 = PALETTE[(hash(seed) >> 3) % PALETTE.length];
  return (
    <div className={`cover cover-fallback ${className}`} style={{ ...style, background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
      <Music size={size ? Math.max(14, size * 0.35) : 32} />
    </div>
  );
}
