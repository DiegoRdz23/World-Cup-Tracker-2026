export default function ProbBar({ pct, color = '#00D463', height = 6, showLabel = false }) {
  const w    = Math.max(0, Math.min(100, Math.round(pct * 100)));
  const auto = w >= 60 ? '#00D463' : w >= 35 ? '#FFD600' : '#FF3B30';
  const fill = color !== '#00D463' ? color : auto;

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full overflow-hidden flex-1"
        style={{ height, backgroundColor: '#1C2A45' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${w}%`,
            background: `linear-gradient(to right, ${fill}88, ${fill})`,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color: fill }}>
          {w}%
        </span>
      )}
    </div>
  );
}
