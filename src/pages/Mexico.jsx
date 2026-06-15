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

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">{home.flag}</span>
          <span
            className="text-sm font-display font-bold"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: fixture.home === 'MEX' ? '#0A6E35' : '#1C2E42',
            }}
          >
            {home.name}
          </span>
        </div>

        {played ? (
          <div className="flex items-center gap-1 font-bold text-xl tabular-nums text-text">
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
          <span
            className="text-sm font-display font-bold"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: fixture.away === 'MEX' ? '#0A6E35' : '#1C2E42',
            }}
          >
            {away.name}
          </span>
          <span className="text-lg">{away.flag}</span>
        </div>
      </div>

      {!played && (
        <div className="space-y-0.5 text-xs text-muted">
          <div className="flex justify-between">
            <span>{home.name} gana</span>
            <span className="font-bold" style={{ color: '#1C2E42' }}>{Math.round(probs.win * 100)}%</span>
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

  return (
    <div className="space-y-6">
      {/* Header México */}
      <div className="card relative overflow-hidden" style={{ borderLeft: '4px solid #0A6E35' }}>
        {/* Grid sutil */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#BBD5DA22 1px, transparent 1px), linear-gradient(90deg, #BBD5DA22 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow verde */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(10,110,53,0.05) 0%, transparent 50%)' }}
        />

        <div className="relative z-10">
          <div className="tag mb-4">🇲🇽 Selección Mexicana</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div
                className="font-display font-bold tabular-nums leading-none"
                style={{ fontSize: '3.5rem', color: '#0A6E35' }}
              >
                {Math.round((probs.pQualify ?? 0) * 100)}%
              </div>
              <div className="tag mt-2">clasifica</div>
              <div className="mt-2">
                <ProbBar pct={probs.pQualify ?? 0} color="#0A6E35" height={6} />
              </div>
            </div>
            <div className="text-center">
              <div
                className="font-display font-bold tabular-nums leading-none"
                style={{ fontSize: '3.5rem', color: '#A07808' }}
              >
                {Math.round((probs.pChampion ?? 0) * 1000) / 10}%
              </div>
              <div className="tag mt-2">campeón</div>
              <div className="mt-2">
                <ProbBar pct={probs.pChampion ?? 0} color="#A07808" height={6} />
              </div>
            </div>
          </div>

          {/* Camino al título */}
          <div className="mt-5">
            <div className="tag mb-2">Camino al título</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Clasificar', p: probs.pQualify  ?? 0, color: '#0A6E35' },
                { label: 'Top 8',      p: probs.pTop8     ?? 0, color: '#3674B5' },
                { label: 'Final',      p: probs.pFinal    ?? 0, color: '#A07808' },
                { label: 'Campeón',    p: probs.pChampion ?? 0, color: '#A07808' },
              ].map(({ label, p, color }, i, arr) => (
                <div key={label} className="relative">
                  <div className="card py-3 px-1">
                    <div
                      className="font-display font-bold tabular-nums"
                      style={{ fontSize: '1.2rem', color }}
                    >
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

      {/* Tabla del Grupo */}
      <div>
        <div className="tag mb-3">Grupo {group} — Tabla actual</div>
        <div className="space-y-2">
          {standings.map((s, i) => {
            const team = TEAMS[s.code];
            const isMex = s.code === 'MEX';
            return (
              <div
                key={s.code}
                className="card2 flex items-center gap-3"
                style={{ borderLeft: isMex ? '3px solid #0A6E35' : undefined }}
              >
                <span className="text-muted text-xs w-4">{i + 1}</span>
                <span className="text-lg">{team.flag}</span>
                <span
                  className="flex-1 text-sm font-display font-bold"
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isMex ? '#0A6E35' : '#1C2E42',
                  }}
                >
                  {team.name}
                </span>
                <div className="flex gap-3 text-xs tabular-nums text-right">
                  <span className="text-muted">PJ {s.pj}</span>
                  <span className="text-muted">GD {s.gd >= 0 ? '+' : ''}{s.gd}</span>
                  <span className="font-bold text-base text-text">{s.pts}</span>
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
