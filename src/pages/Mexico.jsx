import { useApp } from '../App';
import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES_BY_TEAM } from '../data/fixtures';
import { getCurrentStandings, getMatchProbs } from '../model/simulation';
import ProbBar from '../components/ProbBar';

function MatchCard({ fixture, results, isMexMatch }) {
  const r = results[fixture.id];
  const played = r?.played;
  const home = TEAMS[fixture.home];
  const away = TEAMS[fixture.away];
  const probs = !played ? getMatchProbs(fixture.home, fixture.away) : null;

  return (
    <div className={`card2 space-y-2 ${isMexMatch ? 'border-green/30' : ''}`}>
      <div className="tag text-xs">{fixture.date} · Grupo {fixture.group} · J{fixture.matchday}</div>

      {/* Equipos y resultado/probs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">{home.flag}</span>
          <span className={`text-sm font-bold ${fixture.home === 'MEX' ? 'text-green' : ''}`}>
            {home.name}
          </span>
        </div>

        {played ? (
          <div className="flex items-center gap-1 font-bold text-xl tabular-nums">
            <span>{r.homeScore}</span>
            <span className="text-muted text-sm">–</span>
            <span>{r.awayScore}</span>
          </div>
        ) : (
          <div className="text-muted text-sm tabular-nums">
            {Math.round(probs.win * 100)}–{Math.round(probs.draw * 100)}–{Math.round(probs.lose * 100)}
          </div>
        )}

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className={`text-sm font-bold ${fixture.away === 'MEX' ? 'text-green' : ''}`}>
            {away.name}
          </span>
          <span className="text-lg">{away.flag}</span>
        </div>
      </div>

      {!played && (
        <div className="space-y-0.5 text-xs text-muted">
          <div className="flex justify-between">
            <span>{home.name} gana</span>
            <span className="font-bold text-white">{Math.round(probs.win * 100)}%</span>
          </div>
          <ProbBar pct={probs.win} height={3} />
        </div>
      )}
    </div>
  );
}

export default function Mexico() {
  const { predictions, results } = useApp();
  const probs   = predictions['MEX'] ?? {};
  const group   = TEAMS['MEX'].group;
  const standings = getCurrentStandings(group, results);
  const mexFixtures = FIXTURES_BY_TEAM['MEX'] ?? [];

  const pct = (v) => `${Math.round((v ?? 0) * 100)}%`;

  return (
    <div className="space-y-6">
      {/* Header México */}
      <div className="card bg-card2 border-green/40 relative overflow-hidden">
        {/* Ambient verde sobre la card */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(0,212,99,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <div className="tag mb-4">🇲🇽 Selección Mexicana</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-green tabular-nums leading-none">
                {Math.round((probs.pQualify ?? 0) * 100)}%
              </div>
              <div className="tag mt-2">clasifica</div>
              <div className="mt-2">
                <ProbBar pct={probs.pQualify ?? 0} color="#00D463" height={6} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-gold tabular-nums leading-none">
                {Math.round((probs.pChampion ?? 0) * 1000) / 10}%
              </div>
              <div className="tag mt-2">campeón</div>
              <div className="mt-2">
                <ProbBar pct={probs.pChampion ?? 0} color="#FFD600" height={6} />
              </div>
            </div>
          </div>

          {/* Camino al título */}
          <div className="mt-5">
            <div className="tag mb-2">Camino al título</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Clasificar', p: probs.pQualify  ?? 0, color: '#00D463' },
                { label: 'Top 8',      p: probs.pTop8     ?? 0, color: '#00B4FF' },
                { label: 'Final',      p: probs.pFinal    ?? 0, color: '#FFD600' },
                { label: 'Campeón',    p: probs.pChampion ?? 0, color: '#FFD600' },
              ].map(({ label, p, color }, i, arr) => (
                <div key={label} className="relative">
                  <div className="card py-3 px-1">
                    <div className="text-lg font-bold tabular-nums" style={{ color }}>
                      {Math.round(p * 100)}%
                    </div>
                    <div className="text-xs text-muted mt-0.5">{label}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-border text-xs z-10">›</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla del Grupo A */}
      <div>
        <div className="tag mb-3">Grupo {group} — Tabla actual</div>
        <div className="space-y-2">
          {standings.map((s, i) => {
            const team = TEAMS[s.code];
            const isMex = s.code === 'MEX';
            return (
              <div
                key={s.code}
                className={`card2 flex items-center gap-3 ${isMex ? 'border-green/30 bg-card' : ''}`}
              >
                <span className="text-muted text-xs w-4">{i + 1}</span>
                <span className="text-lg">{team.flag}</span>
                <span className={`flex-1 text-sm font-bold ${isMex ? 'text-green' : ''}`}>
                  {team.name}
                </span>
                <div className="flex gap-3 text-xs tabular-nums text-right">
                  <span className="text-muted">PJ {s.pj}</span>
                  <span className="text-muted">GD {s.gd >= 0 ? '+' : ''}{s.gd}</span>
                  <span className="font-bold text-base">{s.pts}</span>
                </div>
                <div className="w-16">
                  <ProbBar pct={predictions[s.code]?.pQualify ?? 0} showLabel height={4} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted mt-1 text-right">
          % = prob. de clasificar
        </div>
      </div>

      {/* Partidos de México */}
      <div>
        <div className="tag mb-3">Partidos de México</div>
        <div className="space-y-2">
          {mexFixtures.map(f => (
            <MatchCard
              key={f.id}
              fixture={f}
              results={results}
              isMexMatch={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
