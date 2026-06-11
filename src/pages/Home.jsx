import { useApp } from '../App';
import { TEAMS, TOP_CONTENDERS } from '../data/teams';
import ProbBar from '../components/ProbBar';

function ChampionCard({ code, pChampion, rank }) {
  const team = TEAMS[code];
  const pct  = Math.round(pChampion * 100 * 10) / 10;
  const isMexico = code === 'MEX';

  return (
    <div
      className={`card flex items-center gap-4 ${
        isMexico ? 'border-green bg-card2' : ''
      }`}
    >
      <span className="text-muted text-xs w-5 text-right">{rank}</span>
      <span className="text-2xl">{team.flag}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm ${isMexico ? 'text-green' : ''}`}>
          {team.name}
          {isMexico && <span className="ml-2 text-xs text-green/60">← nosotros</span>}
        </div>
        <ProbBar pct={pChampion} height={5} />
      </div>
      <div className="text-right">
        <div className={`text-xl font-bold tabular-nums ${isMexico ? 'text-green' : 'text-white'}`}>
          {pct}%
        </div>
        <div className="tag text-xs">campeón</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { predictions } = useApp();

  // Ordenar todos los equipos por pChampion
  const ranked = Object.entries(predictions)
    .sort((a, b) => b[1].pChampion - a[1].pChampion);

  // Top 10 + México si no está en el top 10
  const top10 = ranked.slice(0, 10).map(([code]) => code);
  if (!top10.includes('MEX')) top10.push('MEX');

  // Líder actual
  const [leaderCode] = ranked[0] ?? ['---', {}];
  const leader = TEAMS[leaderCode];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="tag mb-1">Monte Carlo · 8,000 simulaciones</div>
        <h1 className="text-2xl font-bold">¿Quién gana el Mundial?</h1>
      </div>

      {/* Favorito destacado */}
      {leader && (
        <div className="card bg-card2 text-center py-6 space-y-1">
          <div className="tag mb-2">Favorito #1</div>
          <div className="text-5xl">{leader.flag}</div>
          <div className="text-xl font-bold mt-2">{leader.name}</div>
          <div className="text-4xl font-bold text-gold tabular-nums">
            {Math.round(predictions[leaderCode]?.pChampion * 1000) / 10}%
          </div>
          <div className="tag">de probabilidad</div>
        </div>
      )}

      {/* Tabla de candidatos */}
      <div>
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

      {/* Footer disclaimer */}
      <p className="text-xs text-muted text-center pb-4">
        Predicciones estadísticas de entretenimiento. No es asesoría de apuestas.
        Modelo Poisson + Monte Carlo basado en ranking FIFA.
      </p>
    </div>
  );
}
