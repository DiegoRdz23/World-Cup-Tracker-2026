import { useMemo } from 'react';
import { useApp } from '../App';
import { GROUPS } from '../data/teams';
import { KO_FIXTURES } from '../data/ko-fixtures';
import { getCurrentStandings, resolveKOSlot } from '../model/simulation';

const ROUND_META = {
  R32:   { label: '16avos de final',   color: '#4A6E8A' },
  R16:   { label: 'Octavos de final',  color: '#3674B5' },
  QF:    { label: 'Cuartos de final',  color: '#A07808' },
  SF:    { label: 'Semifinales',       color: '#C45020' },
  F:     { label: 'Final',             color: '#A07808' },
  '3rd': { label: 'Tercer lugar',      color: '#7A9AA8' },
};

const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', 'F', '3rd'];

function MatchCard({ fixture, allGroupStandings, koResults }) {
  const home = resolveKOSlot(fixture.home, allGroupStandings, koResults);
  const away = resolveKOSlot(fixture.away, allGroupStandings, koResults);
  const result = koResults[String(fixture.id)];
  const played = result?.played;
  const isMexHome = home?.code === 'MEX';
  const isMexAway = away?.code === 'MEX';

  function slotLabel(code) {
    if (!code) return '–';
    const posMatch = code.match(/^([123])([A-L])$/);
    if (posMatch) return `${posMatch[1]}° Grupo ${posMatch[2]}`;
    const winMatch = code.match(/^W(\d+)$/);
    if (winMatch) return `Gan. P${winMatch[1]}`;
    const loseMatch = code.match(/^L(\d+)$/);
    if (loseMatch) return `Per. P${loseMatch[1]}`;
    return code;
  }

  return (
    <div className={`card2 space-y-1.5 min-w-0 ${(isMexHome || isMexAway) ? 'border-green/30' : ''}`}>
      <div className="text-xs text-muted">P{fixture.id} · {fixture.date}</div>

      <div className={`flex items-center gap-2 text-sm ${isMexHome ? 'text-green font-bold' : home ? '' : 'text-muted'}`}>
        {home ? (
          <><span className="text-base">{home.flag}</span><span className="truncate">{home.name}</span></>
        ) : (
          <span className="text-xs italic">{slotLabel(fixture.home)}</span>
        )}
        {played && <span className="ml-auto font-bold tabular-nums">{result.homeScore}</span>}
      </div>

      <div className={`flex items-center gap-2 text-sm ${isMexAway ? 'text-green font-bold' : away ? '' : 'text-muted'}`}>
        {away ? (
          <><span className="text-base">{away.flag}</span><span className="truncate">{away.name}</span></>
        ) : (
          <span className="text-xs italic">{slotLabel(fixture.away)}</span>
        )}
        {played && <span className="ml-auto font-bold tabular-nums">{result.awayScore}</span>}
      </div>

      <div className="text-xs text-muted truncate">{fixture.stadium}</div>
    </div>
  );
}

export default function Eliminatoria() {
  const { results, discipline, koResults } = useApp();

  const allGroupStandings = useMemo(() => {
    const s = {};
    for (const g of Object.keys(GROUPS)) {
      s[g] = getCurrentStandings(g, results, discipline);
    }
    return s;
  }, [results, discipline]);

  const byRound = useMemo(() => {
    const acc = {};
    for (const f of KO_FIXTURES) {
      if (!acc[f.round]) acc[f.round] = [];
      acc[f.round].push(f);
    }
    return acc;
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <div className="tag mb-1">Fase eliminatoria · 32 partidos</div>
        <h1 className="text-xl font-bold">Eliminatoria</h1>
        <p className="text-xs text-muted mt-1">Captura los resultados en Admin → Resultados.</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {ROUND_ORDER.map(round => {
            const fixtures = byRound[round] ?? [];
            if (!fixtures.length) return null;
            const meta = ROUND_META[round];
            return (
              <div key={round} className="flex flex-col gap-2" style={{ width: '220px' }}>
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <div className={`flex flex-col gap-2 ${round === 'R32' ? '' : 'justify-around h-full'}`}>
                  {fixtures.map(f => (
                    <MatchCard
                      key={f.id}
                      fixture={f}
                      allGroupStandings={allGroupStandings}
                      koResults={koResults}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
