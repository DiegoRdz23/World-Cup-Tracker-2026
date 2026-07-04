import { useState, useMemo } from 'react';
import { useApp } from '../App';
import { TEAMS, GROUPS } from '../data/teams';
import { FIXTURES } from '../data/fixtures';
import { KO_FIXTURES } from '../data/ko-fixtures';
import { getMatchProbs, getScoreMatrix, resolveKOSlot, getCurrentStandings } from '../model/simulation';
import ProbBar from '../components/ProbBar';

// Agrupa array de fixtures por fecha ISO, ordenado cronológicamente
function groupByDate(fixtures) {
  const groups = {};
  for (const f of fixtures) {
    if (!groups[f.date]) groups[f.date] = [];
    groups[f.date].push(f);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

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

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'grupos', label: 'Grupos' },
  { id: 'R32',   label: '16avos' },
  { id: 'R16',   label: 'Octavos' },
  { id: 'QF',    label: 'Cuartos' },
  { id: 'SF',    label: 'Semis' },
  { id: 'F',     label: 'Final' },
];

// Rondas que pertenecen a cada pestaña KO
const TAB_ROUNDS = {
  R32: ['R32'],
  R16: ['R16'],
  QF:  ['QF'],
  SF:  ['SF'],
  F:   ['F', '3rd'],
};

// ─── Card de partido en la lista (fase de grupos) ─────────────────────────────
function MatchCard({ fixture, result, onClick }) {
  const home = TEAMS[fixture.home];
  const away = TEAMS[fixture.away];
  const played = result?.played;

  const { lH, lA } = useMemo(
    () => getMatchProbs(fixture.home, fixture.away),
    [fixture.home, fixture.away]
  );

  let scoreColor = '#1C2E42';
  if (played) {
    if (result.homeScore > result.awayScore) scoreColor = '#0A6E35';
    else if (result.homeScore < result.awayScore) scoreColor = '#E05050';
    else scoreColor = '#4A6E8A';
  }

  return (
    <button
      onClick={onClick}
      className="card2 w-full text-left transition-colors"
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl shrink-0">{home.flag}</span>
          <span className="text-sm font-bold truncate">{home.name}</span>
        </div>

        <div className="text-center shrink-0 w-24">
          {played ? (
            <span
              className="font-display font-bold tabular-nums text-xl"
              style={{ color: scoreColor }}
            >
              {result.homeScore} – {result.awayScore}
            </span>
          ) : (
            <span className="text-xs text-muted font-mono whitespace-nowrap">
              λ {lH.toFixed(1)} – {lA.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-bold truncate text-right">{away.name}</span>
          <span className="text-xl shrink-0">{away.flag}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <span className="tag">Grupo {fixture.group}</span>
        <span className="tag">J{fixture.matchday}</span>
        {played && (
          <span className="tag" style={{ color: '#0A6E35' }}>Jugado</span>
        )}
      </div>
    </button>
  );
}

// Determina el color del marcador KO según quién ganó (considera penales)
function koScoreColor(result) {
  if (!result?.played) return '#1C2E42';
  if (result.penalties) {
    return result.homePen > result.awayPen ? '#0A6E35' : '#E05050';
  }
  if (result.homeScore > result.awayScore) return '#0A6E35';
  if (result.homeScore < result.awayScore) return '#E05050';
  return '#1C2E42';
}

// ─── Card de partido eliminatorio ─────────────────────────────────────────────
function KOMatchCard({ fixture, home, away, result, onClick }) {
  const played = result?.played;

  const probs = useMemo(() => {
    if (home?.code && away?.code) return getMatchProbs(home.code, away.code);
    return null;
  }, [home?.code, away?.code]);

  return (
    <button
      onClick={onClick}
      className="card2 w-full text-left transition-colors"
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {home ? (
            <>
              <span className="text-xl shrink-0">{home.flag}</span>
              <span className="text-sm font-bold truncate">{home.name}</span>
            </>
          ) : (
            <span className="text-xs italic text-muted truncate">{slotLabel(fixture.home)}</span>
          )}
        </div>

        <div className="text-center shrink-0 w-24">
          {played ? (
            <div>
              <span className="font-display font-bold tabular-nums text-xl" style={{ color: koScoreColor(result) }}>
                {result.homeScore} – {result.awayScore}
              </span>
              {result.penalties && (
                <div className="text-xs font-mono" style={{ color: '#A07808' }}>
                  {result.homePen}–{result.awayPen} pen.
                </div>
              )}
            </div>
          ) : probs ? (
            <span className="text-xs text-muted font-mono whitespace-nowrap">
              λ {probs.lH.toFixed(1)} – {probs.lA.toFixed(1)}
            </span>
          ) : (
            <span className="text-xs text-muted">vs</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          {away ? (
            <>
              <span className="text-sm font-bold truncate text-right">{away.name}</span>
              <span className="text-xl shrink-0">{away.flag}</span>
            </>
          ) : (
            <span className="text-xs italic text-muted truncate text-right">{slotLabel(fixture.away)}</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <span className="tag">{fixture.city}</span>
        <span className="tag">{formatDate(fixture.date)}</span>
        {played && <span className="tag" style={{ color: '#0A6E35' }}>Jugado</span>}
        {!home || !away ? <span className="tag" style={{ color: '#A07808' }}>Por definir</span> : null}
      </div>
    </button>
  );
}

// ─── Matriz 6×6 de probabilidades Poisson ────────────────────────────────────
function ScoreMatrix({ homeCode, awayCode, actualHome, actualAway }) {
  const { matrix, lH, lA, win, draw, lose } = useMemo(
    () => getScoreMatrix(homeCode, awayCode),
    [homeCode, awayCode]
  );

  const home = TEAMS[homeCode];
  const away = TEAMS[awayCode];

  let maxP = 0, maxI = 0, maxJ = 0;
  for (let i = 0; i <= 5; i++) {
    for (let j = 0; j <= 5; j++) {
      if (matrix[i][j] > maxP) { maxP = matrix[i][j]; maxI = i; maxJ = j; }
    }
  }

  const played = actualHome !== undefined && actualAway !== undefined;

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{home.flag} {home.name} gana</span>
            <span className="font-bold tabular-nums text-sm" style={{ color: '#3674B5' }}>
              {Math.round(win * 100)}%
            </span>
          </div>
          <ProbBar pct={win} color="#3674B5" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Empate</span>
            <span className="font-bold tabular-nums text-sm" style={{ color: '#4A6E8A' }}>
              {Math.round(draw * 100)}%
            </span>
          </div>
          <ProbBar pct={draw} color="#4A6E8A" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{away.flag} {away.name} gana</span>
            <span className="font-bold tabular-nums text-sm" style={{ color: '#E05050' }}>
              {Math.round(lose * 100)}%
            </span>
          </div>
          <ProbBar pct={lose} color="#E05050" />
        </div>

        <div className="flex gap-6 pt-2 border-t border-border">
          <span className="text-xs text-muted">
            λ {home.name} = <b className="text-text">{lH.toFixed(2)}</b>
          </span>
          <span className="text-xs text-muted">
            λ {away.name} = <b className="text-text">{lA.toFixed(2)}</b>
          </span>
        </div>
      </div>

      <div className="card">
        <div className="tag mb-3">Resultados más probables</div>
        <div className="overflow-x-auto">
          <table style={{ borderCollapse: 'separate', borderSpacing: 2 }} className="mx-auto">
            <thead>
              <tr>
                <th style={{ width: 40 }} />
                {[0,1,2,3,4,5].map(j => (
                  <th
                    key={j}
                    className="text-center font-mono text-xs text-muted font-normal"
                    style={{ width: 56, paddingBottom: 4 }}
                  >
                    {away.flag} {j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0,1,2,3,4,5].map(i => (
                <tr key={i}>
                  <td className="text-right font-mono text-xs text-muted pr-2">
                    {home.flag} {i}
                  </td>
                  {[0,1,2,3,4,5].map(j => {
                    const p = matrix[i][j];
                    const pct = Math.round(p * 1000) / 10;
                    const isReal = played && actualHome === i && actualAway === j;
                    const isBest = !played && i === maxI && j === maxJ;

                    const zoneBg = i > j
                      ? 'rgba(54,116,181,0.07)'
                      : i === j
                      ? 'rgba(74,110,138,0.07)'
                      : 'rgba(224,80,80,0.07)';

                    return (
                      <td
                        key={j}
                        className="text-center tabular-nums"
                        style={{
                          width: 56,
                          height: 40,
                          fontSize: 11,
                          fontFamily: 'IBM Plex Mono, monospace',
                          background: isReal ? 'rgba(10,110,53,0.12)' : zoneBg,
                          border: isReal
                            ? '2px solid #0A6E35'
                            : isBest
                            ? '2px solid #3674B5'
                            : '1px solid #D4E8EA',
                          borderRadius: 4,
                          fontWeight: isReal || isBest ? 700 : 400,
                          color: isReal ? '#0A6E35' : isBest ? '#3674B5' : p >= 0.05 ? '#1C2E42' : '#4A6E8A',
                          verticalAlign: 'middle',
                          lineHeight: 1.2,
                        }}
                      >
                        {pct >= 0.1 ? `${pct}%` : '<0.1%'}
                        {isReal && <div style={{ fontSize: 9 }}>✓</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-1">
          {played && (
            <p className="text-xs text-center font-mono" style={{ color: '#0A6E35' }}>
              El resultado {actualHome}–{actualAway} tenía{' '}
              <b>{Math.round((matrix[actualHome]?.[actualAway] ?? 0) * 1000) / 10}%</b> de probabilidad
            </p>
          )}
          {!played && (
            <p className="text-xs text-center text-muted">
              Celda azul = resultado más probable según el modelo
            </p>
          )}
          <p className="text-xs text-center text-muted">
            <span style={{ color: '#3674B5' }}>■</span> Local gana &nbsp;
            <span style={{ color: '#4A6E8A' }}>■</span> Empate &nbsp;
            <span style={{ color: '#E05050' }}>■</span> Visitante gana
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Vista detalle de un partido de grupos ────────────────────────────────────
function MatchDetail({ fixture, result, onBack }) {
  const home = TEAMS[fixture.home];
  const away = TEAMS[fixture.away];
  const played = result?.played;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
      >
        ← Partidos
      </button>

      <div className="card text-center space-y-2">
        <div className="tag">
          Grupo {fixture.group} · Jornada {fixture.matchday} · {formatDate(fixture.date)}
        </div>
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="text-center">
            <div className="text-5xl">{home.flag}</div>
            <div className="font-bold text-sm mt-1">{home.name}</div>
          </div>
          {played ? (
            <div
              className="font-display font-bold tabular-nums"
              style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', color: '#1C2E42' }}
            >
              {result.homeScore} – {result.awayScore}
            </div>
          ) : (
            <div className="text-muted text-2xl font-display">vs</div>
          )}
          <div className="text-center">
            <div className="text-5xl">{away.flag}</div>
            <div className="font-bold text-sm mt-1">{away.name}</div>
          </div>
        </div>
        {!played && (
          <div className="tag">Predicción pre-partido · Modelo Poisson + Rating FIFA</div>
        )}
        {played && (
          <div className="tag" style={{ color: '#0A6E35' }}>
            Partido terminado · Resultado real resaltado en verde ✓
          </div>
        )}
      </div>

      <ScoreMatrix
        homeCode={fixture.home}
        awayCode={fixture.away}
        actualHome={played ? result.homeScore : undefined}
        actualAway={played ? result.awayScore : undefined}
      />
    </div>
  );
}

// ─── Vista detalle de un partido eliminatorio ─────────────────────────────────
function KOMatchDetail({ fixture, allGroupStandings, onBack }) {
  const { koResults, discipline } = useApp();

  const home = useMemo(
    () => resolveKOSlot(fixture.home, allGroupStandings, koResults, discipline),
    [fixture.home, allGroupStandings, koResults, discipline]
  );
  const away = useMemo(
    () => resolveKOSlot(fixture.away, allGroupStandings, koResults, discipline),
    [fixture.away, allGroupStandings, koResults, discipline]
  );

  const result = koResults[String(fixture.id)];
  const played = result?.played;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
      >
        ← Partidos
      </button>

      <div className="card text-center space-y-2">
        <div className="tag">
          {fixture.city} · {fixture.stadium} · {formatDate(fixture.date)}
        </div>
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="text-center" style={{ minWidth: 80 }}>
            {home ? (
              <>
                <div className="text-5xl">{home.flag}</div>
                <div className="font-bold text-sm mt-1">{home.name}</div>
              </>
            ) : (
              <div className="text-muted text-xs italic px-2">{slotLabel(fixture.home)}</div>
            )}
          </div>

          {played ? (
            <div className="text-center">
              <div
                className="font-display font-bold tabular-nums"
                style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', color: '#1C2E42' }}
              >
                {result.homeScore} – {result.awayScore}
              </div>
              {result.penalties && (
                <div className="text-xs font-mono mt-1" style={{ color: '#A07808' }}>
                  Penales {result.homePen}–{result.awayPen}
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted text-2xl font-display">vs</div>
          )}

          <div className="text-center" style={{ minWidth: 80 }}>
            {away ? (
              <>
                <div className="text-5xl">{away.flag}</div>
                <div className="font-bold text-sm mt-1">{away.name}</div>
              </>
            ) : (
              <div className="text-muted text-xs italic px-2">{slotLabel(fixture.away)}</div>
            )}
          </div>
        </div>

        {!played && home && away && (
          <div className="tag">Predicción pre-partido · Modelo Poisson + Rating FIFA</div>
        )}
        {played && (
          <div className="tag" style={{ color: '#0A6E35' }}>
            Partido terminado · Resultado real resaltado en verde ✓
          </div>
        )}
      </div>

      {home && away ? (
        <ScoreMatrix
          homeCode={home.code}
          awayCode={away.code}
          actualHome={played ? result.homeScore : undefined}
          actualAway={played ? result.awayScore : undefined}
        />
      ) : (
        <div className="card text-center py-10 space-y-2">
          <p className="text-muted text-sm">Los equipos de este partido aún no están definidos.</p>
          <p className="text-xs text-muted">
            La tabla de Poisson aparecerá cuando se conozcan los clasificados.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Vista de ronda eliminatoria ──────────────────────────────────────────────
function KORoundView({ tab, allGroupStandings, koResults, discipline, onSelect }) {
  const rounds = TAB_ROUNDS[tab];
  const fixtures = KO_FIXTURES.filter(f => rounds.includes(f.round));

  // En el tab "Final" separamos Final y Tercer Lugar
  const sections = tab === 'F'
    ? [
        { label: 'Final',        items: fixtures.filter(f => f.round === 'F') },
        { label: 'Tercer lugar', items: fixtures.filter(f => f.round === '3rd') },
      ]
    : [{ label: null, items: fixtures }];

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <div key={section.label ?? 'all'} className="space-y-2">
          {section.label && <div className="tag capitalize">{section.label}</div>}
          {section.items.map(f => {
            const home   = resolveKOSlot(f.home, allGroupStandings, koResults, discipline);
            const away   = resolveKOSlot(f.away, allGroupStandings, koResults, discipline);
            const result = koResults[String(f.id)];
            return (
              <KOMatchCard
                key={f.id}
                fixture={f}
                home={home}
                away={away}
                result={result}
                onClick={() => onSelect(f)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function Partidos() {
  const { results, discipline, koResults } = useApp();
  const [tab, setTab] = useState('grupos');
  const [selected, setSelected] = useState(null); // { type: 'group'|'ko', fixture }

  const grouped = useMemo(() => groupByDate(FIXTURES), []);

  const allGroupStandings = useMemo(() => {
    const s = {};
    for (const g of Object.keys(GROUPS)) {
      s[g] = getCurrentStandings(g, results, discipline);
    }
    return s;
  }, [results, discipline]);

  // ─── Vistas de detalle ───────────────────────────────────────────────────
  if (selected?.type === 'group') {
    return (
      <MatchDetail
        fixture={selected.fixture}
        result={results[selected.fixture.id]}
        onBack={() => setSelected(null)}
      />
    );
  }

  if (selected?.type === 'ko') {
    return (
      <KOMatchDetail
        fixture={selected.fixture}
        allGroupStandings={allGroupStandings}
        onBack={() => setSelected(null)}
      />
    );
  }

  // ─── Lista ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="fade-up">
        <div className="tag mb-1">
          {tab === 'grupos' ? `Fase de grupos · ${FIXTURES.length} partidos` : 'Fase eliminatoria'}
        </div>
        <h1
          className="font-display font-bold text-2xl text-text"
          style={{ letterSpacing: '0.03em', textTransform: 'uppercase' }}
        >
          Partidos
        </h1>
        <p className="text-xs text-muted mt-1">
          Antes del partido: goles esperados (λ) y tabla de Poisson. Después: resultado real resaltado.
        </p>
      </div>

      {/* Barra de sub-pestañas */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelected(null); }}
            className={`px-3 py-1.5 text-xs font-mono whitespace-nowrap rounded border transition-all ${
              tab === t.id
                ? 'bg-blue text-white border-blue font-bold'
                : 'bg-card text-muted border-border hover:text-text'
            }`}
            style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido según pestaña */}
      {tab === 'grupos' ? (
        <div className="space-y-6">
          {grouped.map(([date, fixtures]) => (
            <div key={date} className="space-y-2 fade-up">
              <div className="tag capitalize">{formatDate(date)}</div>
              {fixtures.map(f => (
                <MatchCard
                  key={f.id}
                  fixture={f}
                  result={results[f.id]}
                  onClick={() => setSelected({ type: 'group', fixture: f })}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <KORoundView
          tab={tab}
          allGroupStandings={allGroupStandings}
          koResults={koResults}
          discipline={discipline}
          onSelect={f => setSelected({ type: 'ko', fixture: f })}
        />
      )}
    </div>
  );
}
