import { useApp } from '../App';
import { TEAMS } from '../data/teams';
import ProbBar from '../components/ProbBar';

const MEDALS = ['🥇', '🥈', '🥉'];

function ChampionCard({ code, pChampion, rank }) {
  const team    = TEAMS[code];
  const pct     = Math.round(pChampion * 100 * 10) / 10;
  const isMex   = code === 'MEX';
  const isTop3  = rank <= 3;
  const medal   = rank <= 3 ? MEDALS[rank - 1] : null;

  return (
    <div
      className={`card flex items-center gap-4 transition-colors ${
        isMex ? 'border-green/50 bg-card2' : ''
      }`}
      style={isTop3 && !isMex ? {
        borderLeftWidth: 2,
        borderLeftColor: rank === 1 ? '#FFD600' : rank === 2 ? '#C0C0C0' : '#CD7F32',
      } : {}}
    >
      <span className="w-6 text-center text-sm">
        {medal ?? <span className="text-muted text-xs">{rank}</span>}
      </span>
      <span className="text-2xl">{team.flag}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm ${isMex ? 'text-green' : ''}`}>
          {team.name}
          {isMex && <span className="ml-2 text-xs text-green/60">← nosotros</span>}
        </div>
        <ProbBar pct={pChampion} height={4} />
      </div>
      <div className="text-right shrink-0">
        <div
          className="text-xl font-bold tabular-nums"
          style={{ color: isMex ? '#00D463' : isTop3 ? '#FFD600' : '#E2ECF9' }}
        >
          {pct}%
        </div>
        <div className="tag text-xs">campeón</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { predictions } = useApp();

  const ranked = Object.entries(predictions)
    .sort((a, b) => b[1].pChampion - a[1].pChampion);

  const top10 = ranked.slice(0, 10).map(([code]) => code);
  if (!top10.includes('MEX')) top10.push('MEX');

  const [leaderCode] = ranked[0] ?? ['---', {}];
  const leader = TEAMS[leaderCode];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-up">
        <div className="tag mb-1">Monte Carlo · 8,000 simulaciones</div>
        <h1 className="text-2xl font-bold">¿Quién gana el Mundial?</h1>
      </div>

      {/* Hero — spotlight del favorito */}
      {leader && (
        <div className="card bg-card2 relative overflow-hidden py-10 text-center fade-up">
          {/* Spotlight radial: la apuesta visual del diseño */}
          <div
            className="absolute inset-0 pointer-events-none glow-breath"
            style={{
              background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(0,212,99,0.12) 0%, transparent 68%)',
            }}
          />

          <div className="relative z-10 space-y-2">
            <div className="tag">Favorito · Monte Carlo</div>
            <div className="text-7xl leading-none mt-3 select-none">{leader.flag}</div>
            <div className="text-base font-bold mt-2 tracking-wide">{leader.name}</div>
            <div className="text-5xl font-bold tabular-nums leading-none" style={{ color: '#FFD600' }}>
              {Math.round(predictions[leaderCode]?.pChampion * 1000) / 10}%
            </div>
            <div className="tag">de ganar el Mundial</div>
          </div>
        </div>
      )}

      {/* Ranking de candidatos */}
      <div className="fade-up">
        <div className="tag mb-3">Top candidatos</div>
        <div className="space-y-2">
          {top10.map((code, i) => (
            <ChampionCard
              key={code}
              code={code}
              pChampion={predictions[code]?.pChampion ?? 0}
              rank={ranked.findIndex(([c]) => c === code) + 1}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-muted text-center pb-4 fade-up">
        Predicciones estadísticas de entretenimiento. No es asesoría de apuestas.
        Modelo Poisson + Monte Carlo basado en ranking FIFA.
      </p>
    </div>
  );
}
