export function Logo({ size = 32, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Artify logo">
        <defs>
          <linearGradient id="artify-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="0.55" stopColor="#ec4899" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="url(#artify-g)" />
        <path d="M17 49 L32 14 L47 49" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <g fill="#fff">
          <rect x="25" y="35" width="3.4" height="7" rx="1.7" />
          <rect x="30.3" y="30" width="3.4" height="12" rx="1.7" />
          <rect x="35.6" y="33" width="3.4" height="9" rx="1.7" />
        </g>
      </svg>
      {withText && <span className="logo-text">Artify</span>}
    </div>
  );
}
