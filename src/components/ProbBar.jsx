export default function ProbBar({ pct, color = '#0A6E35', height = 6, showLabel = false }) {
  const w    = Math.max(0, Math.min(100, Math.round(pct * 100)));
  // Auto: verde (alto) → azul (medio) → rojo (bajo)
  const auto = w >= 60 ? '#0A6E35' : w >= 35 ? '#3674B5' : '#E05050';
  const fill = color !== '#0A6E35' ? color : auto;

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full overflow-hidden flex-1"
        style={{ height, backgroundColor: '#D4E8EA' }}
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
