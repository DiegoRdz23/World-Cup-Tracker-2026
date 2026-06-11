import { useApp } from '../App';
import { TEAMS, GROUPS } from '../data/teams';
import { getCurrentStandings } from '../model/simulation';
import ProbBar from '../components/ProbBar';

function GroupTable({ groupKey }) {
  const { results, predictions } = useApp();
  const standings = getCurrentStandings(groupKey, results);

  return (
    <div className="card space-y-1">
      <div className="flex items-center justify-between mb-2">
        <div className="tag">Grupo {groupKey}</div>
        <div className="text-xs text-muted">pts  clasifica</div>
      </div>

      {standings.map((s, i) => {
        const team  = TEAMS[s.code];
        const isMex = s.code === 'MEX';
        const pQ    = predictions[s.code]?.pQualify ?? 0;
        const advancing = i < 2;

        return (
          <div
            key={s.code}
            className={`flex items-center gap-2 py-1 px-2 rounded ${
              isMex
                ? 'bg-green/10 border border-green/20'
                : advancing
                ? ''
                : 'opacity-60'
            }`}
          >
            <span className="text-muted text-xs w-4">{i + 1}</span>
            <span className="text-base">{team.flag}</span>
            <span className={`flex-1 text-sm ${isMex ? 'text-green font-bold' : ''}`}>
              {team.name}
            </span>
            <span className="text-xs tabular-nums text-muted">
              {s.pj > 0 ? `${s.pj}j` : '–'}
            </span>
            <span className="text-sm font-bold tabular-nums w-5 text-right">{s.pts}</span>
            <div className="w-20 flex items-center gap-1">
              <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: 4, backgroundColor: '#1C2A45' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round(pQ * 100)}%`,
                    backgroundColor: pQ >= 0.6 ? '#00D463' : pQ >= 0.35 ? '#FFD600' : '#FF3B30',
                  }}
                />
              </div>
              <span
                className="text-xs tabular-nums w-7 text-right font-bold"
                style={{ color: pQ >= 0.6 ? '#00D463' : pQ >= 0.35 ? '#FFD600' : '#FF3B30' }}
              >
                {Math.round(pQ * 100)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Groups() {
  return (
    <div className="space-y-4">
      <div>
        <div className="tag mb-1">Fase de grupos · 12 grupos · 48 equipos</div>
        <h1 className="text-xl font-bold">Grupos</h1>
        <p className="text-xs text-muted mt-1">
          % = probabilidad de clasificar a octavos según el modelo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.keys(GROUPS).map(g => (
          <GroupTable key={g} groupKey={g} />
        ))}
      </div>
    </div>
  );
}
